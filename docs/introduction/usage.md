---
layout: default
title: Usage
description: 'Usage instructions for @42.nl/react-flash-messages.'
parent: Introduction
permalink: /usage
nav_order: 3
---

## Writing a LoginForm.

In order to log the user in you must have a login form of some sorts.
This library does not assume anything on how this login form should
work or what it looks like.

Here's what a LoginForm should do:

1. Call 'login' when the user submits the login form, with the correct body.
2. Try to auto-login the user via `current` in the componentDidMount.
3. In the `render` Redirect the user when he is logged in.

For example:

```tsx
import React, { Component } from 'react';
import { Redirect, locationShape } from 'react-router-dom';
import { login, current } from '@42nl/authentication';

interface Props {
  loggedIn: boolean;
  location: locationShape;
}

interface State {
  username: string;
  password: string;
  error: boolean;
  autoLoginFailed: boolean;
}

export class Login extends Component<Props, State> {
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
    login({ username, password }).catch(error => {
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

      return <Redirect to={from} />;
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
            value={username}
            onChange={event => this.setUsername(event.target.value)}
          />
        </p>

        <p>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={event => this.setPassword(event.target.value)}
          />
        </p>

        <p>{errorMessage}</p>

        <button type="sumbit" onClick={event => this.onSubmit(event)}>
          Log in
        </button>
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

```tsx
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

  return <button>type="button" onClick={onLogout}> Logout</button>;
}
```

## Make a Route private

Some routes can only be accessible when the user is logged in.
You can do this via the IsAuthenticated for example:

```tsx
import { IsAuthenticated } from "./IsAuthenticated";

<BrowserRouter history={browserHistory}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/users/*"
      element={
        <IsAuthenticated>
          <Users />
        </IsAuthenticated>
      }
    />
  </Routes>
</BrowserRouter>
```

When the user tries to go to a route with IsAuthenticated, he will be redirected
to the Config's route `loginRoute`.

## Add authorization to a Route

Some routes can only be accessed by a type of user or a specific
user. You can do this via the IsAuthorized.

```tsx
import { IsAuthorized } from "./IsAuthorized";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/users/*"
      element={
        <IsAuthenticated>
          <Users />
        </IsAuthenticated>
      }
    />
    <Route
      path="/pictures/*"
      element={
        <IsAuthorized
          authorizer={(authenticationStore: AuthenticationStore) => authenticationStore.currentUser.role === 'ADMIN'}
        >
          <Pictures />
        </IsAuthorized>
      }
    />
  </Routes>
</BrowserRouter>
```

The authorizer function is only ran if the user is logged in.
The authorizer is given the authenticationStore as the first
parameter, and is expected to return a boolean.

When the user tries to go to a route with IsAuthorized, he will be redirected
to the Config's route `loginRoute`.

## Get the login status

Lets say you have a component which needs to know whether the
user is logged in, you can use the hook `useIsLoggedIn` for this:

```tsx
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

```tsx
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

```tsx
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

```tsx
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

```tsx

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
