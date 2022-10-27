import { AxiosError } from 'axios';
import { getService } from './config';

// Get the XSRF token from the cookies.
export function getXSRFToken(): string {
  return document.cookie.replace(
    /(?:^|.*;\s*)XSRF-TOKEN\s*=\s*([^;]*).*$|^.*$/,
    '$1'
  );
}

/**
 * Axios interceptor to automatically log the user out in the Redux store
 * when the request you sent returns a 401 Not Authenticated.
 */
export function authInterceptor(error: AxiosError | { status: number }) {
  if (isStatus401(error)) {
    getService().logout();
  }

  return Promise.reject(error);
}

function isStatus401(error: AxiosError | { status: number }) {
  if (error.hasOwnProperty('response')) {
    return (error as AxiosError)?.response?.status === 401;
  }

  return error?.status === 401;
}

/**
 * Calls fetch and makes sure that credentials: 'same-origin' is passed
 * in the options block. Also adds the X-XSRF-TOKEN to the header when a
 * non 'get' request is made.
 *
 * When the request you send returns a 401 the user is automatically
 * logged out in the Redux store.
 *
 * @param {String} url to send the request to
 * @param {Object} options optional object to send with the request
 * @return {Promise} fetch promise
 */
export async function authFetch(
  url: RequestInfo,
  options: RequestInit = {}
): Promise<Response> {
  const service = getService();

  let headers = options.headers || {};
  if (options.method !== 'get') {
    headers = {
      'X-XSRF-TOKEN': getXSRFToken(),
      ...headers
    };
  }

  const config = {
    ...options,
    credentials: 'same-origin' as RequestCredentials,
    headers
  };

  const response = await fetch(url, config);
  if (response.status === 401) {
    service.logout();
    return response;
  }

  return response;
}
