import { login, current, logout } from '../src/actions';
import { configureAuthentication } from '../src/config';
import * as config from '../src/config';

describe('AuthenticationService', () => {
  function setup() {
    const loginSpy = jest.fn();
    const logoutSpy = jest.fn();

    // Mock the action creators
    // @ts-expect-error test mock
    config.getService = jest.fn(() => ({ logout: logoutSpy, login: loginSpy }));

    configureAuthentication();

    return { logoutSpy, loginSpy };
  }

  describe('login', () => {
    test('200', async () => {
      expect.assertions(4);

      const { loginSpy } = setup();

      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ fake: 'user' })
      });

      await login({ user: 'Maarten', password: 'netraam' });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/authentication',
        expect.objectContaining({
          method: 'post',
          credentials: 'same-origin'
        })
      );

      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(loginSpy).toHaveBeenCalledWith({ fake: 'user' });
    });

    test('500', async () => {
      expect.assertions(3);

      const { loginSpy } = setup();

      global.fetch = jest.fn().mockResolvedValue({
        status: 500
      });

      try {
        await login({ user: 'Maarten', password: 'netraam' });
        fail();
      } catch (response) {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/authentication',
          expect.objectContaining({
            method: 'post',
            credentials: 'same-origin'
          })
        );
        expect(loginSpy).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('current', () => {
    test('200', async () => {
      expect.assertions(4);

      const { loginSpy } = setup();

      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ fake: 'current' })
      });

      await current();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/authentication/current',
        expect.objectContaining({
          method: 'get'
        })
      );
      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(loginSpy).toHaveBeenCalledWith({ fake: 'current' });
    });

    test('500', async () => {
      expect.assertions(3);

      const { loginSpy } = setup();

      global.fetch = jest.fn().mockResolvedValue({
        status: 500
      });

      try {
        await current();
        fail();
      } catch (response) {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/authentication/current',
          expect.objectContaining({
            method: 'get'
          })
        );
        expect(loginSpy).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('logout', () => {
    test('200', async () => {
      expect.assertions(3);

      const { logoutSpy } = setup();

      global.fetch = jest.fn().mockResolvedValue({
        status: 200
      });

      await logout();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/authentication',
        expect.objectContaining({
          method: 'delete'
        })
      );
      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });

    test('500', async () => {
      expect.assertions(4);

      const { logoutSpy } = setup();

      global.fetch = jest.fn().mockResolvedValue({
        status: 500
      });

      try {
        await logout();
        fail();
      } catch (e: unknown) {
        const response = e as Response;
        expect(response.status).toBe(500);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/authentication',
          expect.objectContaining({
            method: 'delete'
          })
        );
        expect(logoutSpy).toHaveBeenCalledTimes(0);
      }
    });
  });
});
