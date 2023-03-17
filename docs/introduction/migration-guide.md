---
layout: default
title: Migration guide
description: 'Migration guide for @42.nl/react-authentication.'
parent: Introduction
permalink: /migration-guide
nav_order: 4
---

## v1 to v2

We upgraded React Router from v5 to v6, which means routing changed.
It is not possible to wrap the Route component anymore, so we now
provide IsAuthenticated and IsAuthorized instead of PrivateRoute and
AuthorizedRoute. They essentially do the same, but the implementation
changed.

With React Router v5 you could do this:
```tsx
import { AuthorizedRoute, PrivateRoute } from "@42.nl/authentication";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <AuthorizedRoute
          path="/users"
          authorizer={(authenticationStore: AuthenticationStore) => authenticationStore.currentUser.role === "ADMIN"}
        >
          <Users />
        </AuthorizedRoute>
        <PrivateRoute path="/">
          <Dashboard />
        </PrivateRoute>
        <Route path="/login">
          <Login />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
```

But with React Router v6 you have to change it to this:

```tsx
import { IsAuthenticated, IsAuthorized } from "@42.nl/authentication";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <IsAuthenticated>
              <Dashboard />
            </IsAuthenticated>
          }
        />
        <Route
          path="users/*"
          element={
            <IsAuthorized
              authorizer={(authenticationStore: AuthenticationStore) => authenticationStore.currentUser.role === "ADMIN"}
            >
              <Users />
            </IsAuthorized>
          }
        />
        <Route path="login">
          <Login />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```
