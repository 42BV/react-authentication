import React from 'react';
import {
  Route,
  Redirect,
  RouteComponentProps,
  RouteProps
} from 'react-router-dom';

import { getConfig, Config } from '../config';
import { useAuthentication } from '../hooks';

export interface Props extends RouteProps {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
}

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
export function PrivateRoute({
  component,
  ...rest
}: Props): JSX.Element {
  const config: Config = getConfig();
  const authentication = useAuthentication();

  return (
    <Route
      {...rest}
      render={(
        props: RouteComponentProps & React.ClassAttributes<typeof component>
      ) =>
        //@ts-ignore
        authentication.isLoggedIn ? (
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
