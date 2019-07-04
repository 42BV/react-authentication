import fetchMock from 'fetch-mock';

import { login, current, logout } from '../src/actions';
import { configureAuthentication } from '../src/config';
import * as config from '../src/config';

describe('AuthenticationService', () => {
  let loginSpy: jest.Mock<any, any>;
  let logoutSpy: jest.Mock<any, any>;

  beforeEach(() => {
    loginSpy = jest.fn();
    logoutSpy = jest.fn();

    // Mock the action creators
    // @ts-ignore
    config.getService = jest.fn(() => ({logout: logoutSpy, login: loginSpy}));

    configureAuthentication({
      authenticationUrl: '/api/authentication',
      currentUserUrl: '/api/authentication/current',
      loginRoute: '/login'
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  describe('login', () => {
    test('200', async () => {
      fetchMock.post('/api/authentication', { fake: 'user' });

      await login({ user: 'Maarten', password: 'netraam' });

      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(loginSpy).toHaveBeenCalledWith({ fake: 'user' });
    });

    test('500', async () => {
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
      fetchMock.get('/api/authentication/current', { fake: 'current' });
      await current();

      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(loginSpy).toHaveBeenCalledWith({ fake: 'current' });
    });

    test('500', async () => {
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
      fetchMock.delete('/api/authentication', 200);

      await logout();

      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });

    test('500', async () => {
      fetchMock.delete('/api/authentication', 500);

      try {
        await logout();
        fail();
      } catch (response) {
        expect(response.status).toBe(500);

        expect(logoutSpy).toHaveBeenCalledTimes(0);
      }
    });
  });
});
