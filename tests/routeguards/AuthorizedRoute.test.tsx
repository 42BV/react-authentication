import React from 'react';
import { createMemoryHistory } from 'history';
import { Router, Route, Switch } from 'react-router-dom';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { configureAuthentication, getService } from '../../src/config';
import { AuthorizedRoute } from '../../src/routeguards/AuthorizedRoute';
import { PrivateRoute } from '../../src/routeguards/PrivateRoute';

function Dashboard(): JSX.Element {
  return <h1 data-testid="header">Hello logged in user</h1>;
}

function AdminArea(): JSX.Element {
  return <h1 data-testid="header">Hello logged in admin</h1>;
}

function Login(): JSX.Element {
  return <h1 data-testid="header">Please log in</h1>;
}

afterEach(cleanup);

type User = {
  isAdmin: boolean;
};

describe('AuthorizedRoute', () => {
  function setup({
    isLoggedIn,
    isAdmin,
    route
  }: {
    isLoggedIn: boolean;
    isAdmin: boolean;
    route: string;
  }) {
    configureAuthentication({
      authenticationUrl: '/api/authentication',
      currentUserUrl: '/api/authentication/current',
      loginRoute: '/login',
      dashboardRoute: '/'
    });

    if (isLoggedIn) {
      getService().login({ isAdmin });
    }

    const history = createMemoryHistory({ initialEntries: [route] });

    return render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/" exact>
            <Dashboard />
          </PrivateRoute>

          <AuthorizedRoute<User>
            authorizer={(user) => user.isAdmin}
            path="/admin"
            exact
          >
            <AdminArea />
          </AuthorizedRoute>
          <Route path="/login" exact>
            <Login />
          </Route>
        </Switch>
      </Router>
    );
  }

  test('loggedIn as admin', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({
      isLoggedIn: true,
      isAdmin: true,
      route: '/admin'
    });

    await waitFor(() => {
      expect(getByTestId('header')).toHaveTextContent('Hello logged in admin');
    });
  });

  test('loggedIn as non admin', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({
      isLoggedIn: true,
      isAdmin: false,
      route: '/admin'
    });
    const route = getByTestId('header');

    await waitFor(() => {
      expect(route).toHaveTextContent('Hello logged in user');
    });
  });

  test('not logged in but somehow admin', () => {
    const { getByTestId } = setup({
      isLoggedIn: false,
      isAdmin: true,
      route: '/admin'
    });

    expect(getByTestId('header')).toHaveTextContent('Please log in');
  });

  test('not logged in', () => {
    const { getByTestId } = setup({
      isLoggedIn: false,
      isAdmin: false,
      route: '/admin'
    });

    expect(getByTestId('header')).toHaveTextContent('Please log in');
  });
});
