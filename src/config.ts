import { makeAuthenticationService, AuthenticationService } from './service';

export interface Config {
  // The URL to POST login request and DELETE logout request.
  authenticationUrl: string;

  // The URL to GET retrieve the current user from.
  currentUserUrl: string;

  /*
    The location to redirect the user to when the user is not logged in.
    Used by PrivateRoute and AuthorizedRoute.
    */
  loginRoute: string;

  /*
    The location to redirect the user to when the user is logged in, 
    but not authorized to see a route. Used by AuthorizedRoute.
    */
  dashboardRoute: string;
}

let config: Config | null = null;
let service: AuthenticationService<any> | null = null;

/**
 * Configures the Authentication libary.
 *
 * @param {Config} The new configuration
 */
export function configureAuthentication<User>(
  c: Config = {
    authenticationUrl: '/api/authentication',
    currentUserUrl: '/api/authentication/current',
    loginRoute: '/login',
    dashboardRoute: '/'
  }
): void {
  config = c;
  service = makeAuthenticationService<User>();
}

/**
 * Either returns the a Config or throws an error when the
 * config is not yet initialized.
 *
 * @returns The Config
 */
export function getConfig(): Config {
  if (config === null) {
    throw new Error('The authentication service is not initialized.');
  } else {
    return config;
  }
}

export function getService(): AuthenticationService<any> {
  if (service === null) {
    throw new Error('The authentication service is not initialized.');
  } else {
    return service;
  }
}

// Testing purposes only
export function setConfig(c: Config | null): void {
  config = c;
}

export function setService(s: AuthenticationService<any> | null): void {
  service = s;
}
