import '@testing-library/jest-dom';
import { Component } from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';

import { configureAuthentication, getService } from '../src/config';
import { useCurrentUser, useIsLoggedIn } from '../src/hooks';

afterEach(cleanup);

type User = {
  username: string;
};

describe('useCurrentUser', () => {
  function Welcome() {
    const user = useCurrentUser<User>();

    return <p data-testid="header">Welcome {user.username}</p>;
  }

  class ErrorBoundary extends Component {
    state = {
      hasError: false,
      message: ''
    };

    static getDerivedStateFromError(error: Error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true, message: error.message };
    }

    render() {
      const { hasError, message } = this.state;

      if (hasError) {
        // You can render any custom fallback UI
        return <h1 data-testid="error">{message}</h1>;
      }

      // @ts-expect-error Props should include children
      return this.props.children;
    }
  }

  function setup({ isLoggedIn }: { isLoggedIn: boolean }) {
    configureAuthentication<User>();

    if (isLoggedIn) {
      getService().login({ username: 'John' });
    }

    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    return render(
      <ErrorBoundary>
        <Welcome />
      </ErrorBoundary>
    );
  }

  test('loggedIn', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({ isLoggedIn: true });

    await waitFor(() => {
      expect(getByTestId('header')).toHaveTextContent('Welcome John');
    });
  });

  test('not logged in', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({ isLoggedIn: false });

    await waitFor(() => {
      expect(getByTestId('error')).toHaveTextContent(
        '@42bv/authentication: Asked for current user whilst not logged in'
      );
    });
  });
});

describe('useLoggedIn', () => {
  function Component() {
    const isLoggedIn = useIsLoggedIn();

    return (
      <p data-testid="header">
        {isLoggedIn ? 'You are logged in' : 'Please log in'}
      </p>
    );
  }

  function setup({ isLoggedIn }: { isLoggedIn: boolean }) {
    configureAuthentication<User>();

    if (isLoggedIn) {
      getService().login({ username: 'John' });
    }

    return render(<Component />);
  }

  test('loggedIn', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({ isLoggedIn: true });

    await waitFor(() => {
      expect(getByTestId('header')).toHaveTextContent('You are logged in');
    });
  });

  test('not logged in', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({ isLoggedIn: false });

    await waitFor(() => {
      expect(getByTestId('header')).toHaveTextContent('Please log in');
    });
  });
});
