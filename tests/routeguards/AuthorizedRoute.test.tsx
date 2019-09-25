import React from 'react';
import { createMemoryHistory } from 'history';
import { Router, Route, Switch } from 'react-router-dom';
import { render, cleanup, wait } from '@testing-library/react';
import 'jest-dom/extend-expect';

import { configureAuthentication, getService } from '../../src/config';

import { AuthorizedRoute } from '../../src/routeguards/AuthorizedRoute';

function Dashboard(): JSX.Element {
  return <h1 data-testid="header">Hello World</h1>;
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
    isAdmin
  }: {
    isLoggedIn: boolean;
    isAdmin: boolean;
  }) {
    configureAuthentication({
      authenticationUrl: '/api/authentication',
      currentUserUrl: '/api/authentication/current',
      loginRoute: '/login'
    });

    if (isLoggedIn) {
      getService().login({ isAdmin });
    }

    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });

    return render(
      <Router history={history}>
        <Switch>
          <AuthorizedRoute<User>
            authorizer={user => user.isAdmin}
            path="/dashboard"
            exact
          >
            <Dashboard />
          </AuthorizedRoute>
          <Route path="/login" exact>
            <Login />
          </Route>
        </Switch>
      </Router>
    );
  }

  test('loggedIn as admin', async () => {
    const { getByTestId } = setup({ isLoggedIn: true, isAdmin: true });

    await wait(() => {
      expect(getByTestId('header')).toHaveTextContent('Hello World');
    });
  });

  test('loggedIn as non admin', async () => {
    const { getByTestId } = setup({ isLoggedIn: true, isAdmin: false });

    await wait(() => {
      expect(getByTestId('header')).toHaveTextContent('Please log in');
    });
  });

  test('not logged in', () => {
    const { getByTestId } = setup({ isLoggedIn: false, isAdmin: true });

    expect(getByTestId('header')).toHaveTextContent('Please log in');
  });
});
