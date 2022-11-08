import { authFetch, authInterceptor } from '../src/utils';
import * as config from '../src/config';

describe('authInterceptor', () => {
  it('should call logout when status is 401', async () => {
    expect.assertions(1);

    const logoutSpy = jest.fn();
    jest.spyOn(config, 'getService').mockReturnValue({
      login: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      getState: jest.fn(),
      logout: logoutSpy
    });

    await authInterceptor({ response: { status: 401 } }).catch(() => undefined);

    expect(logoutSpy).toBeCalledTimes(1);
  });

  it('should not call logout when status is 500', async () => {
    expect.assertions(1);

    const logoutSpy = jest.fn();
    jest.spyOn(config, 'getService').mockReturnValue({
      login: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      getState: jest.fn(),
      logout: logoutSpy
    });

    await authInterceptor({ response: { status: 500 } }).catch(() => undefined);

    expect(logoutSpy).toBeCalledTimes(0);
  });
});

describe('authFetch', () => {
  function setup() {
    const logout = jest.fn();

    // @ts-expect-error test mock
    config.getService = jest.fn(() => ({ logout }));

    document.cookie = 'XSRF-TOKEN=d3add0g';

    return { logout };
  }

  test('without options', async () => {
    expect.assertions(4);

    const { logout } = setup();

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ fake: 'fake' })
    });

    const data = await authFetch('/api/GET');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/GET', {
      credentials: 'same-origin',
      headers: {
        'X-XSRF-TOKEN': 'd3add0g'
      }
    });

    const json = await data.json();

    expect(json).toEqual({ fake: 'fake' });

    expect(logout).toHaveBeenCalledTimes(0);
  });

  describe('headers', () => {
    test('without CSRF token', async () => {
      expect.assertions(4);

      const { logout } = setup();

      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ fake: 'fake' })
      });

      const data = await authFetch('/api/GET', { method: 'get' });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/GET', {
        method: 'get',
        credentials: 'same-origin',
        headers: {}
      });

      const json = await data.json();

      expect(json).toEqual({ fake: 'fake' });

      expect(logout).toHaveBeenCalledTimes(0);
    });

    test('with CSRF token', async () => {
      expect.assertions(4);

      const { logout } = setup();

      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ fake: 'fake' })
      });

      const data = await authFetch('/api/POST', {
        method: 'post'
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/POST', {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'X-XSRF-TOKEN': 'd3add0g'
        }
      });

      const json = await data.json();

      expect(json).toEqual({ fake: 'fake' });
      expect(logout).toHaveBeenCalledTimes(0);
    });

    test('with user headers', async () => {
      expect.assertions(4);

      const { logout } = setup();

      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ fake: 'fake' })
      });

      const data = await authFetch('/api/POST', {
        method: 'post',
        headers: { 'X-AWESOME': '42' }
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/POST', {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'X-XSRF-TOKEN': 'd3add0g',
          'X-AWESOME': '42'
        }
      });

      const json = await data.json();

      expect(json).toEqual({ fake: 'fake' });
      expect(logout).toHaveBeenCalledTimes(0);
    });
  });

  test('401 error handling', async () => {
    expect.assertions(4);

    const { logout } = setup();

    global.fetch = jest.fn().mockResolvedValue({
      status: 401,
      json: () => Promise.resolve({ fake: 'fake' })
    });

    const data = await authFetch('/api/GET', { method: 'get' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/GET', {
      method: 'get',
      credentials: 'same-origin',
      headers: {}
    });

    const json = await data.json();

    expect(json).toEqual({ fake: 'fake' });
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
