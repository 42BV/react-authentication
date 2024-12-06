import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router';
import { cleanup, render, waitFor } from '@testing-library/react';

import { configureAuthentication, getService } from '../../src/config';

import { IsAuthenticated } from '../../src/routeguards/IsAuthenticated';

function Dashboard() {
  return <h1 data-testid="header">Hello World</h1>;
}

function Login() {
  return <h1 data-testid="header">Please log in</h1>;
}

afterEach(cleanup);

describe('IsAuthenticated', () => {
  function setup({
    isLoggedIn,
    path = '/dashboard'
  }: {
    isLoggedIn: boolean;
    path?: string;
  }) {
    configureAuthentication();

    if (isLoggedIn) {
      getService().login({});
    }

    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/">
            <Route
              path="dashboard"
              element={
                <IsAuthenticated>
                  <Dashboard />
                </IsAuthenticated>
              }
            />
            <Route path="users" element={<IsAuthenticated />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  test('loggedIn', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({ isLoggedIn: true });

    await waitFor(() => {
      expect(getByTestId('header')).toHaveTextContent('Hello World');
    });
  });

  test('loggedIn - subroutes', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({ isLoggedIn: true, path: '/users' });

    await waitFor(() => {
      expect(getByTestId('header')).toHaveTextContent('Hello World');
    });
  });

  test('not logged in', () => {
    const { getByTestId } = setup({ isLoggedIn: false });

    expect(getByTestId('header')).toHaveTextContent('Please log in');
  });
});
