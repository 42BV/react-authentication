import { vi } from 'vitest';
import { current, login, logout } from '../src/actions';
import * as config from '../src/config';
import { configureAuthentication } from '../src/config';

describe('AuthenticationService', () => {
  function setup() {
    const loginSpy = vi.fn();
    const logoutSpy = vi.fn();

    // Mock the action creators
    vi.spyOn(config, 'getService').mockReturnValue({
      logout: logoutSpy,
      login: loginSpy,
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      getState: vi.fn()
    });

    configureAuthentication();

    return { logoutSpy, loginSpy };
  }

  describe('login', () => {
    test('200', async () => {
      expect.assertions(4);

      const { loginSpy } = setup();

      global.fetch = vi.fn().mockResolvedValue({
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

      global.fetch = vi.fn().mockResolvedValue({
        status: 500
      });

      try {
        await login({ user: 'Maarten', password: 'netraam' });
        throw new Error('should not reach');
      } catch {
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

      global.fetch = vi.fn().mockResolvedValue({
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

      global.fetch = vi.fn().mockResolvedValue({
        status: 500
      });

      try {
        await current();
        throw new Error('should not reach');
      } catch {
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

      global.fetch = vi.fn().mockResolvedValue({
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

      global.fetch = vi.fn().mockResolvedValue({
        status: 500
      });

      try {
        await logout();
        throw new Error('should not reach');
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
