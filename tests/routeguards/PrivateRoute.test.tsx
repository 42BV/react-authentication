import React from 'react';
import { createMemoryHistory } from 'history';
import { Router, Route, Switch } from 'react-router-dom';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { configureAuthentication, getService } from '../../src/config';

import { PrivateRoute } from '../../src/routeguards/PrivateRoute';

function Dashboard() {
  return <h1 data-testid="header">Hello World</h1>;
}

function Login() {
  return <h1 data-testid="header">Please log in</h1>;
}

afterEach(cleanup);

describe('PrivateRoute', () => {
  function setup({ isLoggedIn }: { isLoggedIn: boolean }) {
    configureAuthentication();

    if (isLoggedIn) {
      getService().login({});
    }

    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });

    return render(
      <Router history={history}>
        <Switch>
          <PrivateRoute path="/dashboard" exact>
            <Dashboard />
          </PrivateRoute>
          <Route path="/login" exact>
            <Login />
          </Route>
        </Switch>
      </Router>
    );
  }

  test('loggedIn', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({ isLoggedIn: true });

    await waitFor(() => {
      expect(getByTestId('header')).toHaveTextContent('Hello World');
    });
  });

  test('not logged in', () => {
    const { getByTestId } = setup({ isLoggedIn: false });

    expect(getByTestId('header')).toHaveTextContent('Please log in');
  });
});
