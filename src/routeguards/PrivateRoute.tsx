import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useLocation } from 'react-router';

import { getConfig, Config } from '../config';
import { useAuthentication } from '../hooks';

/**
 * Works just like a regular Route except for when the user is
 * not logged in. If the user is not logged in it will Redirect
 * the user to the loginRoute as configured in the Config object.
 *
 * @example
 * ``` JavaScript
 *  <PrivateRoute path="/" component={ Dashboard }/>
 * ```
 *
 * @param props The props for the PrivateRoute
 * @returns Either the Component or a Redirect
 */
export function PrivateRoute({ children, ...rest }: RouteProps): JSX.Element {
  const config: Config = getConfig();
  const location = useLocation();
  const authentication = useAuthentication();

  if (authentication.isLoggedIn === false) {
    return (
      <Redirect
        to={{
          pathname: config.loginRoute,
          state: { from: location }
        }}
      />
    );
  }

  return <Route {...rest}>{children}</Route>;
}
