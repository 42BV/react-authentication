import fetchMock from 'fetch-mock';

import { authFetch } from '../src/utils';
import * as config from '../src/config';

describe('authFetch', () => {
  function setup() {
    const logout = jest.fn();

    // @ts-expect-error test mock
    config.getService = jest.fn(() => ({ logout }));

    document.cookie = 'XSRF-TOKEN=d3add0g';

    return { logout };
  }

  afterEach(() => {
    fetchMock.restore();
  });

  describe('headers', () => {
    test('without CSRF token', async () => {
      expect.assertions(2);

      const { logout } = setup();

      fetchMock.get(
        '/api/GET',
        { fake: 'fake' },
        {
          // @ts-expect-error test mock
          credentials: 'same-origin'
        }
      );

      const data = await authFetch('/api/GET');

      const json = await data.json();

      expect(json).toEqual({ fake: 'fake' });

      expect(logout).toHaveBeenCalledTimes(0);
    });

    test('with CSRF token', async () => {
      expect.assertions(2);

      const { logout } = setup();

      fetchMock.post(
        '/api/POST',
        { fake: 'fake' },
        {
          // @ts-expect-error test mock
          credentials: 'same-origin',
          headers: { 'X-XSRF-TOKEN': 'd3add0g' }
        }
      );

      const data = await authFetch('/api/POST', {
        method: 'post'
      });

      const json = await data.json();

      expect(json).toEqual({ fake: 'fake' });
      expect(logout).toHaveBeenCalledTimes(0);
    });

    test('with user headers', async () => {
      expect.assertions(2);

      const { logout } = setup();

      fetchMock.post(
        '/api/POST',
        { fake: 'fake' },
        {
          // @ts-expect-error test mock
          credentials: 'same-origin',
          headers: { 'X-XSRF-TOKEN': 'd3add0g', 'X-AWESOME': '42' }
        }
      );

      const data = await authFetch('/api/POST', {
        method: 'post',
        headers: { 'X-AWESOME': '42' }
      });

      const json = await data.json();

      expect(json).toEqual({ fake: 'fake' });
      expect(logout).toHaveBeenCalledTimes(0);
    });
  });

  test('401 error handling', async () => {
    expect.assertions(2);

    const { logout } = setup();

    fetchMock.get(
      '/api/GET',
      {
        status: 401,
        body: '{ "fake": "fake" }'
      },
      {
        // @ts-expect-error test mock
        credentials: 'same-origin'
      }
    );

    const data = await authFetch('/api/GET', { method: 'get' });
    const json = await data.json();

    expect(json).toEqual({ fake: 'fake' });
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
