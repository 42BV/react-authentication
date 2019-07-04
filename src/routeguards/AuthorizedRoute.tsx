import React from 'react';
import {
  Route,
  Redirect,
  RouteComponentProps,
  RouteProps
} from 'react-router-dom';

import { getConfig, Config } from '../config';
import { useAuthentication } from '../hooks';

export type Authorizer<User> = (user: User) => boolean;

export interface Props<User> extends RouteProps {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
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
  component,
  authorizer,
  ...rest
}: Props<User>): JSX.Element {
  const config: Config = getConfig();
  const authentication = useAuthentication();

  // @ts-ignore
  const isLoggedIn = authentication.isLoggedIn;

  // @ts-ignore
  const user: User = authentication.currentUser;
  
  // @ts-ignore
  const allowed = isLoggedIn && authorizer(user);

  return (
    <Route
      {...rest}
      render={(
        props: RouteComponentProps & React.ClassAttributes<typeof component>
      ) =>
        allowed ? (
          React.createElement(component, props)
        ) : (
          <Redirect
            to={{
              pathname: config.loginRoute,
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
}
