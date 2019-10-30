import {
  configureAuthentication,
  getConfig,
  Config,
  getService,
  setConfig,
  setService
} from '../src/config';

describe('config', () => {
  afterEach(() => {
    setConfig(null);
    setService(null);
  });

  test('default values', () => {
    configureAuthentication();
    expect(getConfig()).toEqual({
      authenticationUrl: '/api/authentication',
      currentUserUrl: '/api/authentication/current',
      loginRoute: '/login',
      dashboardRoute: '/'
    });
  });

  test('configuration lifecycle', () => {
    // When not initialized it should throw an error.
    expect(() => getConfig()).toThrow(
      'The authentication service is not initialized.'
    );

    expect(() => getService()).toThrow(
      'The authentication service is not initialized.'
    );

    // Next we initialize the config.
    const config: Config = {
      authenticationUrl: '/api/authentication',
      currentUserUrl: '/api/authentication/current',
      loginRoute: '/login',
      dashboardRoute: '/'
    };

    configureAuthentication(config);

    // Now we expect the config to be set.
    expect(getConfig()).toBe(config);

    expect(getService()).not.toBe(null);
  });
});
