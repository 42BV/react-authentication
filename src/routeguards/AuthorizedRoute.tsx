import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useLocation } from 'react-router';

import { getConfig, Config } from '../config';
import { useAuthentication } from '../hooks';

export type Authorizer<User> = (user: User) => boolean;

export interface Props<User> extends RouteProps {
  authorizer: Authorizer<User>;
}

/**
 * Works just like a regular Route except for when the user is
 * not logged in and a mandatory check for e.g. permissions.
 * If the user is not logged in or does not satisfy the mandatory check it will Redirect
 * the user to the loginRoute as configured in the Config object.
 *
 * @example
 * ``` JavaScript
 *  <AuthorizedRoute
 *    path="/"
 *    component={ Dashboard }
 *    authorizer={({ currentUser } => currentUser !== undefined && currentUser.role === 'SUPER_USER' )}
 *  />
 * ```
 *
 * @param props The props for the AuthorizedRoute
 * @returns Either the Component or a Redirect
 */
export function AuthorizedRoute<User>({
  authorizer,
  children,
  ...rest
}: Props<User>): JSX.Element {
  const config: Config = getConfig();
  const authentication = useAuthentication();
  const location = useLocation();

  const isLoggedIn = authentication.isLoggedIn;

  /*
  We first check if the user is logged in before authorizing, this prevents
  a redirect loop where a redirect mechanism is in place within login that automatically redirects
  users to the previous attempted route upon login.
  */
  if (!isLoggedIn) {
    return <Redirect to={{ pathname: config.loginRoute, state: location }} />;
  }

  /*
  After we have asserted that the user is not logged in, but somehow lacks privileges,
  we send it to the dashboard instead of the login to prevent the loop from happening.
  */
  const user = authentication.currentUser as User;
  const allowed = authorizer(user);

  if (!allowed) {
    return <Redirect to={{ pathname: config.dashboardRoute }} />;
  }

  return <Route {...rest}>{children}</Route>;
}
