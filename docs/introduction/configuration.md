---
layout: default
title: Configuration
description: 'Configuration instructions for @42.nl/react-authentication.'
parent: Introduction
permalink: /configuration
nav_order: 2
---

Configure the authentication module:

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

The authentication module must be configured before the application is rendered.
