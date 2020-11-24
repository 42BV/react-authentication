import { makeAuthenticationService } from '../src/service';

type User = {
  username: string;
};

describe('AuthenticationService', () => {
  test('login should alter state and inform subscribers', async (done) => {
    expect.assertions(2);

    const service = makeAuthenticationService<User>();

    const user: User = { username: 'Henk' };

    service.login(user);

    service.subscribe((state) => {
      expect(state.currentUser).toBe(user);
      expect(state.isLoggedIn).toBe(true);

      done();
    });
  });

  test('logout should alter state and inform subscribers', async (done) => {
    expect.assertions(2);

    const service = makeAuthenticationService<User>();

    service.logout();

    service.subscribe((state) => {
      expect(state.currentUser).toBe(undefined);
      expect(state.isLoggedIn).toBe(false);

      done();
    });
  });

  test('subscription lifecycle', () => {
    const service = makeAuthenticationService<User>();

    // Subscribe a subscriber.
    const subscriber = jest.fn();
    service.subscribe(subscriber);

    // It should immediately receive the state after subscribing.
    expect(subscriber).toBeCalledTimes(1);

    // Call logout which should inform the subscriber.
    service.logout();
    expect(subscriber).toBeCalledTimes(2);

    // Unsubscribe the subscriber, and call logout.
    service.unsubscribe(subscriber);

    service.logout();

    // It should not have been informed anymore.
    expect(subscriber).toBeCalledTimes(2);
  });
});
