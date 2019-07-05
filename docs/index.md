---
layout: default
---

# About

[![Build Status](https://travis-ci.org/42BV/react-authentication.svg?branch=master)](https://travis-ci.org/42BV/react-authentication)
[![Codecov](https://codecov.io/gh/42BV/react-authentication/branch/master/graph/badge.svg)](https://codecov.io/gh/42BV/react-authentication)

This is 42's authentication module for React in combination with
a specific Spring Security settings.

It can do the following things:

  1. Log the user in and out with your Spring application.
  2. Saving the current user in a store
  3. Send 'fetch' request with XSRF tokens and the cookies.
  4. Make a route only available for logged in users.
  5. Make a route available for specific users, based on properties
     of the current user.
  6. Make the state of the store available as handy set of hooks.

# Getting started.

First install the following dependencies:

`npm install @42.nl/authentication --save`

Next you have to configure the authentication module:

```js
import React from 'react';
import { render } from 'react-dom';

import {
  configureAuthentication,
  authFetch,
  AuthenticationProvider
} from '@42.nl/authentication';

import App from './App';

configureAuthentication({
  // The URL of your Spring back-end where the user can login (POST) and logout(DELETE)
  authenticationUrl: '/api/authentication',

  // The URL of your Spring back-end where the current user can be requested via GET
  currentUserUrl: '/api/authentication/current',

  // The route (in the front-end) the user should be redirected to when not logged in.
  loginRoute: '/login'
});
const rootElement = document.getElementById('root');

// Register the AuthenticationProvider, not required when never 
// using the `AuthenticationContext`.
if (rootElement) {
  render(
    <AuthenticationProvider>
      <App/>
    </AuthenticationProvider>,
    rootElement
  );
}
```

The authentication module must be configured before the application
is rendered.

# How to

## Writing a LoginForm.

In order to log the user in you must have a login form of some sorts.
This library does not assume anything on how this login form should
work or what it looks like.

Here's what a LoginForm should do:

  1. Call 'login' when the user submits the login form, with the correct body.
  2. Try to auto-login the user via `current` in the componentDidMount.
  3. In the `render` Redirect the user when he is logged in.

For example:

```js
import React, { Component } from 'react';
import { Redirect, locationShape } from 'react-router-dom';
import { login, current } from '@42nl/authentication';

interface Props {
  loggedIn: boolean,
  location: locationShape
};

interface State {
  username: string,
  password: string,
  error: boolean,
  autoLoginFailed: boolean
};

export export class Login extends Component<Props, State> {
  state = {
    username: '',
    password: '',
    error: false,
    autoLoginFailed: false
  };

  // Calling `current()` automatically logs the user in when the session is still valid
  componentDidMount() {
    current().catch(() => {
      this.setState({ autoLoginFailed: true });
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();

    const { username, password } = this.state;

    this.setState({ error: false });

    // `login` expects a body to send to the server
    login({ username, password }).catch((error) => {
      this.setState({ error: true });
    });
  }

  setUsername(username: string) {
    this.setState({ username });
  }

  setPassword(password: string) {
    this.setState({ password });
  }

  render() {
    // Be sure 
    if (this.props.loggedIn) {
      const { from } = this.props.location.state || { from: { pathname: '/' } };

      return <Redirect to={ from }/>;
    }

    if (this.state.autoLoginFailed === false) {
      return null;
    }

    const { username, password, error } = this.state;

    const errorMessage = error ? 'Username and password are incorrect' : '';

    return (
      <form>
        <h1>Please log in</h1>
        <p>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={ username }
            onChange={ (event) => this.setUsername(event.target.value) }
          />
        </p>

        <p>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={ password }
            onChange={ (event) => this.setPassword(event.target.value) }
          />
        </p>

        <p>{ errorMessage }</p>

        <button type="sumbit" onClick={ (event) => this.onSubmit(event) }>Log in</button>
      </form>
    );
  }
}
```

## Writing a Logout

In order to logout you must call the 'logout' function, and make
sure you Redirect the user to the login form when the user is
logged in.

For example:

```js
import React from 'react';
import { Redirect } from 'react-router-dom';
import { logout, useIsLoggedIn } from '@42.nl/authentication';

export default function Logout() {
  const isLoggedIn = useIsLoggedIn();

  async function onLogout() {
    await logout();
    window.location.reload();
  }

  if (isLoggedIn === false) {
    return <Redirect to="/" />;
  }

  return (
    <button>
      type="button"
      onClick={onLogout}
    >
      Logout
    </button>
  );
}

```

## Make a Route private

Some routes can only be accessible when the user is logged in.
You can do this via the PrivateRoute for example:

```js
<BrowserRouter history={ browserHistory }>
  <div>
    <Route exact path="/" component={ Dashboard } />
    <Route path="/login" component={ Login }/>
    <PrivateRoute path="/users" component={ Users } />
  </div>
</BrowserRouter>
```

PrivateRoute works exacly like Route, except that it does not
support a `render` method. You must always provide a Component
instead.

When the user tries to go to a PrivateRoute he will be redirected
to the Config's route `loginRoute`.

## Add authorization to a Route

Some routes can only be accessed by a type of user or a specific
user. You can do this via the AuthorizedRoute.

```js
<BrowserRouter>
  <div>
    <Route exact path="/" component={ Dashboard } />
    <Route path="/login" component={ Login }/>
    <PrivateRoute path="/users" component={ Users } />
    <AuthorizedRoute 
      path="/pictures" 
      component={ Pictures }
      authorizer={ (authenticationStore: AuthenticationStore) => {
        return authenticationStore.currentUser.role === 'ADMIN';
      }}
    />
  </div>
</BrowserRouter>
```

The authorizer function is only ran if the user is logged in.
The authorizer is given the authenticationStore as the first
parameter, and is expected to return a boolean.

AuthorizedRoute works exacly like Route, except that it does not
support a `render` method. You must always provide a Component
instead.

When the user tries to go to a AuthorizedRoute he will be redirected
to the Config's route `loginRoute`.

## Get the login status

Lets say you have a component which needs to know whether the
user is logged in, you can use the hook `useIsLoggedIn` for this:

```js
import { useIsLoggedIn } from '@42.nl/authentication';

function User() {
  const isLoggedIn = useIsLoggedIn();

  if (isLoggedIn) {
    return <h1>You are logged in</h1>;
  } else {
    return <h1>Please log in</h1>;
  }
}
```

## Get the current user object

Lets say you have a component which must render some information
about the current user, you can use the hook `useCurrentUser` for this:

```js
import { useCurrentUser } from '@42.nl/authentication';

interface User {
  name: string;
}

function User() {
  const currentUser = useCurrentUser<User>();

  return <h1>Hi {% raw %}{ currentUser.name } {% endraw %}</h1>;
}
```

Warning: you should only use `useCurrentUser` when you know that
the user is currently logged in. Otherwise you will get an error.

The idea behind this is that you do not want to keep checking optionals
/ maybe types throughout your application, when you use the information
on pages which are behind a login.

If you want to access the currentUser in a place where the login
is unknown use `useAuthentication` instead.

## Get the authentication state

Finally there are two ways to access the entire login state.

### Via useAuthentication

This variant uses a hook called `useAuthentication` which is preferred:

```js
import { useAuthentication } from '@42.nl/authentication';

interface User {
  name: string;
}

function User() {
  const authentication = useAuthentication<User>();

  if (authentication.isLoggedIn) {
    return <h1>Hi {% raw %}{ currentUser.name }{% endraw %}</h1>;
  } else {
    return <h1>Please log in</h1>;
  }
}
```

### Via AuthenticationContext

This variant uses the `AuthenticationContext`, which you should only
use when using a class Component. Try using `useAuthentication` if
it is possible instead.

```js
import { AuthenticationContext } from '@42.nl/authentication';

interface User {
  name: string;
}

class User extends React.Component {
  render() {
    return (
      <AuthenticationContext.Consumer>
        {(authentication: AuthenticationState<User> | null) => {
          if (authentication === null) {
            return <p>Unknown</p>;
          } else {
            const text = authentication.isLoggedIn
              ? 'Logged in'
              : 'Please log in';
            return <p>{text}</p>;
          }
        }}
      </AuthenticationContext.Consumer>
    );
  }
}
```

Note: you must have setup the `AuthenticationProvider` before this
works. See "Getting started".

## Send a request with the XSRF token as the current user.

To perform request with the XSRF token and with the cookies from
the current user. You can use the 'authFetch' utility from this
library:

```js

import 'authFetch' from '@42.nl/authentication';

function getUser() {
  authFetch('/user/1').then((response) => {
    console.log(response);
  });
}

```

`authFetch` is a thin wrapper around `fetch`, it only adds the
credentials and XSRF token, so it has the exact same arguments
as `fetch`.
