import fetchMock from 'fetch-mock';

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

  afterEach(() => {
    fetchMock.restore();
  });

  describe('login', () => {
    test('200', async () => {
      expect.assertions(2);

      const { loginSpy } = setup();

      fetchMock.post('/api/authentication', { fake: 'user' });

      await login({ user: 'Maarten', password: 'netraam' });

      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(loginSpy).toHaveBeenCalledWith({ fake: 'user' });
    });

    test('500', async () => {
      expect.assertions(1);

      const { loginSpy } = setup();

      fetchMock.post('/api/authentication', 500);

      try {
        await login({ user: 'Maarten', password: 'netraam' });
        fail();
      } catch (response) {
        expect(loginSpy).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('current', () => {
    test('200', async () => {
      expect.assertions(2);

      const { loginSpy } = setup();

      fetchMock.get('/api/authentication/current', { fake: 'current' });
      await current();

      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(loginSpy).toHaveBeenCalledWith({ fake: 'current' });
    });

    test('500', async () => {
      expect.assertions(1);

      const { loginSpy } = setup();

      fetchMock.get('/api/authentication/current', 500);

      try {
        await current();
        fail();
      } catch (response) {
        expect(loginSpy).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('logout', () => {
    test('200', async () => {
      expect.assertions(1);

      const { logoutSpy } = setup();

      fetchMock.delete('/api/authentication', 200);

      await logout();

      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });

    test('500', async () => {
      expect.assertions(2);

      const { logoutSpy } = setup();

      fetchMock.delete('/api/authentication', 500);

      try {
        await logout();
        fail();
      } catch (e: unknown) {
        const response = e as Response;
        expect(response.status).toBe(500);

        expect(logoutSpy).toHaveBeenCalledTimes(0);
      }
    });
  });
});
