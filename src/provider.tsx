import React, { ReactElement } from 'react';
import { useAuthentication } from './hooks.js';
import { AuthenticationState, getDefaultState } from './service.js';

export const AuthenticationContext = React.createContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AuthenticationState<any>
>(getDefaultState());

export type Props = {
  children: React.ReactNode;
};

export function AuthenticationProvider<User>({
  children
}: Props): ReactElement {
  const authentication = useAuthentication<User>();

  return (
    <AuthenticationContext.Provider value={authentication}>
      {children}
    </AuthenticationContext.Provider>
  );
}
