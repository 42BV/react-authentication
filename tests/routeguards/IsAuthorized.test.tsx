import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router';
import { cleanup, render, waitFor } from '@testing-library/react';

import { configureAuthentication, getService } from '../../src/config';
import { IsAuthorized } from '../../src/routeguards/IsAuthorized';
import { IsAuthenticated } from '../../src/routeguards/IsAuthenticated';

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

describe('IsAuthorized', () => {
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

    return render(
      <MemoryRouter initialEntries={[route]}>
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
            path="/admin"
            element={
              <IsAuthorized<User> authorizer={(user) => !!user?.isAdmin}>
                <AdminArea />
              </IsAuthorized>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
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
