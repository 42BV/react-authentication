import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

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
  function setup({ isLoggedIn }: { isLoggedIn: boolean }) {
    configureAuthentication();

    if (isLoggedIn) {
      getService().login({});
    }

    return render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <IsAuthenticated>
                <Dashboard />
              </IsAuthenticated>
            }
          />
          <Route path="/login" element={<Login />} />
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

  test('not logged in', () => {
    const { getByTestId } = setup({ isLoggedIn: false });

    expect(getByTestId('header')).toHaveTextContent('Please log in');
  });
});
