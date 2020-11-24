import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { AuthenticationProvider, AuthenticationContext } from '../src/provider';
import { configureAuthentication, getService } from '../src/config';
import { AuthenticationState } from '../src/service';

type User = {
  username: string;
};

function Component() {
  return (
    <AuthenticationContext.Consumer>
      {(authentication: AuthenticationState<User> | null) => {
        if (authentication === null) {
          console.log('yo');
          return <p data-testid="header">Unknown</p>;
        } else {
          const text = authentication.isLoggedIn
            ? 'Logged in'
            : 'Please log in';
          return <p data-testid="header">{text}</p>;
        }
      }}
    </AuthenticationContext.Consumer>
  );
}

afterEach(cleanup);

describe('PrivateRoute', () => {
  function setup({ isLoggedIn }: { isLoggedIn: boolean | null }) {
    configureAuthentication();

    if (isLoggedIn === true) {
      getService().login({});
    } else if (isLoggedIn === false) {
      getService().logout();
    }

    return render(
      <AuthenticationProvider<User>>
        <Component />
      </AuthenticationProvider>
    );
  }

  test('loggedIn', async () => {
    expect.assertions(1);

    const { getByTestId } = setup({ isLoggedIn: true });

    await waitFor(() => {
      expect(getByTestId('header')).toHaveTextContent('Logged in');
    });
  });

  test('not logged in', () => {
    const { getByTestId } = setup({ isLoggedIn: false });

    expect(getByTestId('header')).toHaveTextContent('Please log in');
  });
});
