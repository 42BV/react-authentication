import React from 'react';
import { useAuthentication } from './hooks';
import { AuthenticationState, getDefaultState } from './service';

export const AuthenticationContext = React.createContext<AuthenticationState<any>>(getDefaultState());

export interface Props {
  children: React.ReactNode;
}

export function AuthenticationProvider<User>({ children }: Props) {
  const authentication= useAuthentication<User>();

  return (
    <AuthenticationContext.Provider value={authentication}>
      {children}
    </AuthenticationContext.Provider>
  );
}