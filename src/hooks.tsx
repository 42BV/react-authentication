import { useEffect, useState } from 'react';

import { getService } from './config';
import { AuthenticationState } from './service';

/**
 * Returns the authentication state it it exists. Otherwise returns
 * null, when `null` is returned the state of the authentication is
 * simply unknown at this time.
 *
 * This `unknown` state is temporary until the startup of this
 * library has succeeded.
 */
export function useAuthentication<User>(): AuthenticationState<User> {
  const service = getService<User>();

  // During bootup the state is null for unknown.
  const [state, setState] = useState<AuthenticationState<User>>(
    service.getState()
  );

  useEffect(() => {
    const subscriber = (nextState: AuthenticationState<User>) => {
      setState(nextState);
    };

    service.subscribe(subscriber);

    return () => {
      service.unsubscribe(subscriber);
    };
  }, []);

  return state;
}

/**
 * Returns the current user of the application.
 *
 * Note that you are expected to use this hook only when you know
 * for sure that the user is already logged in. This prevents
 * unnecessary null pointer checks you know you are going to pass.
 *
 */
export function useCurrentUser<User>(): User {
  const state = useAuthentication<User>();

  if (!state.isLoggedIn) {
    throw new Error(
      '@42bv/authentication: Asked for current user whilst not logged in'
    );
  } else {
    const user = state.currentUser as User;
    return user;
  }
}

/**
 * Returns whether the user is logged in or not.
 *
 * When the authentication state is still booting, the state is unknown
 * but `useLoggedIn` will return `false` then in that case.
 */
export function useIsLoggedIn(): boolean {
  const state = useAuthentication();

  return state.isLoggedIn;
}
