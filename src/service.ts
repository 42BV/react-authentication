export interface AuthenticationState<User> {
  currentUser?: User;
  isLoggedIn: boolean;
}

export type Subscriber<User> = (state: AuthenticationState<User>) => void;

export interface AuthenticationService<User> {
  login(user: User): void;
  logout(): void;
  subscribe(subscriber: Subscriber<User>): void;
  unsubscribe(subscriber: Subscriber<User>): void;
  getState: () => AuthenticationState<User>;
}

/**
 * Creates a AuthenticationService which stores the current user and
 * whether the user is logged in or out.
 *
 * Exposes a subscription to anyone who wants to listen to the
 * changes to the AuthenticationState.
 */
export function makeAuthenticationService<User>(): AuthenticationService<User> {
  let state: AuthenticationState<User> = getDefaultState();

  let subscribers: Subscriber<User>[] = [];

  return {
    login,
    logout,
    subscribe,
    unsubscribe,
    getState
  };

  function login(user: User): void {
    state = { currentUser: user, isLoggedIn: true };

    informSubscribers();
  }

  function logout(): void {
    state = getDefaultState();

    informSubscribers();
  }

  function getState() {
    return state;
  }

  function subscribe(subscriber: Subscriber<User>): void {
    subscribers.push(subscriber);

    subscriber(state);
  }

  function unsubscribe(subscriber: Subscriber<User>): void {
    subscribers = subscribers.filter(s => s !== subscriber);
  }

  function informSubscribers() {
    subscribers.forEach(subscriber => subscriber({ ...state }));
  }
}

export function getDefaultState<User>(): AuthenticationState<User> {
  return {
    currentUser: undefined,
    isLoggedIn: false
  };
}
