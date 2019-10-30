import React from 'react';
import { render, cleanup, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { configureAuthentication, getService } from '../src/config';
import { useCurrentUser, useIsLoggedIn } from '../src/hooks';

afterEach(cleanup);

type User = {
  username: string;
};

describe('useCurrentUser', () => {
  function Component() {
    const user = useCurrentUser<User>();

    return <p data-testid="header">Welcome {user.username}</p>;
  }

  class ErrorBoundary extends React.Component {
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

      return this.props.children;
    }
  }

  function setup({ isLoggedIn }: { isLoggedIn: boolean }) {
    configureAuthentication<User>();

    if (isLoggedIn) {
      getService().login({ username: 'John' });
    }

    return render(
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    );
  }

  test('loggedIn', async () => {
    const { getByTestId } = setup({ isLoggedIn: true });

    await wait(() => {
      expect(getByTestId('header')).toHaveTextContent('Welcome John');
    });
  });

  test('not logged in', async () => {
    const { getByTestId } = setup({ isLoggedIn: false });

    await wait(() => {
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
    const { getByTestId } = setup({ isLoggedIn: true });

    await wait(() => {
      expect(getByTestId('header')).toHaveTextContent('You are logged in');
    });
  });

  test('not logged in', async () => {
    const { getByTestId } = setup({ isLoggedIn: false });
    await wait(() => {
      expect(getByTestId('header')).toHaveTextContent('Please log in');
    });
  });
});
