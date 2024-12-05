import { ReactElement, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { Config, getConfig } from '../config';
import { useAuthentication } from '../hooks';

export type Authorizer<User> = (user?: User) => boolean;

export type Props<User> = {
  authorizer: Authorizer<User>;
  children: ReactNode;
};

/**
 * Works just like a regular Route except for when the user is
 * not logged in and a mandatory check for e.g. permissions.
 * If the user is not logged in or does not satisfy the mandatory check it will Redirect
 * the user to the loginRoute as configured in the Config object.
 *
 * @example
 * ``` JavaScript
 *  <Route
 *    path="/"
 *    element={
 *      <IsAuthorized
 *        authorizer={({ currentUser } => currentUser !== undefined && currentUser.role === 'SUPER_USER' )}
 *      >
 *        <Dashboard />
 *      </IsAuthorized>
 *    }
 *  />
 * ```
 *
 * @returns Either the Component or a Redirect
 */
export function IsAuthorized<User>({
  authorizer,
  children
}: Props<User>): ReactElement {
  const config: Config = getConfig();
  const { currentUser, isLoggedIn } = useAuthentication<User>();
  const location = useLocation();

  /*
  We first check if the user is logged in before authorizing, this prevents
  a redirect loop where a redirect mechanism is in place within login that automatically redirects
  users to the previous attempted route upon login.
  */
  if (!isLoggedIn) {
    return (
      <Navigate
        to={{ pathname: config.loginRoute }}
        state={{ from: location }}
      />
    );
  }

  /*
  After we have asserted that the user is not logged in, but somehow lacks privileges,
  we send it to the dashboard instead of the login to prevent the loop from happening.
  */
  const allowed = authorizer(currentUser);

  if (!allowed) {
    return <Navigate to={{ pathname: config.dashboardRoute }} />;
  }

  return <>{children}</>;
}
