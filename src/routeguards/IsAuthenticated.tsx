import { ReactElement, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router';

import { Config, getConfig } from '../config';
import { useAuthentication } from '../hooks';

type Props = {
  children: ReactNode;
};

/**
 * Works just like a regular Route except for when the user is
 * not logged in. If the user is not logged in it will Redirect
 * the user to the loginRoute as configured in the Config object.
 *
 * @example
 * ``` JavaScript
 *  <Route
 *    path="/"
 *    element={
 *      <IsAuthenticated>
 *        <Dashboard />
 *      </IsAuthenticated>
 *    }
 *  />
 * ```
 *
 * @returns Either the Component or a Redirect
 */
export function IsAuthenticated({ children }: Props): ReactElement {
  const config: Config = getConfig();
  const location = useLocation();
  const authentication = useAuthentication();

  if (!authentication.isLoggedIn) {
    return (
      <Navigate
        to={{ pathname: config.loginRoute }}
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
}
