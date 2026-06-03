# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### BREAKING CHANGES

- `current()` now expects the back-end to always respond with `200 OK` and a JSON body containing an `authenticated` discriminator. The body shape is:
  - When logged in: `{ "authenticated": true, ...userFields }` — the entire body is stored as the `currentUser`.
  - When not logged in: `{ "authenticated": false }` — the service is set to logged-out state.
- `current()` no longer rejects on `401`. The previous "401 means anonymous" workaround in consumers (`current().catch(r => r.status !== 401 ? throw : noop)`) is no longer required and should be removed.
- Requires `rest-secure-spring-boot-starter` 16.0.0 or newer (or any back-end that implements the discriminator contract on `GET /authentication/current`).

## [0.0.2] - 2019-09-25

### BREAKING CHANGES

- `PrivateRoute` and `AuthorizedRoute` now adhere to the new `Route` API as introduced in `react-router@5.1.0` see: [Upgrade guide](https://reacttraining.com/blog/react-router-v5-1)

### Features

- `npm run release` to aid in preparing a release with `np`.
- `npm run docs` for convenience when running documentation.

## [0.0.1] - 2019-08-04

### Added

- The first version of this library.
