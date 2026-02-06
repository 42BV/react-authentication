# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@42.nl/authentication` is a React library for authenticating with Spring Security backends. It provides a service-based auth state manager, React hooks, route guards, and a fetch wrapper that handles XSRF tokens and auto-logout on 401 responses. Peer dependency: `react-router` v6 or v7.

## Commands

- **Full test suite (lint + typecheck + coverage):** `npm test`
- **Run tests in watch mode:** `npm start`
- **Run only Vitest tests with coverage:** `npm run test:coverage`
- **Run a single test file:** `npx vitest run tests/actions.test.ts`
- **Type-check only:** `npm run test:ts`
- **Lint:** `npm run lint`
- **Build (compile to lib/):** `npm run tsc`
- **Release:** `npm run release` (builds then runs `np`)

## Architecture

The library uses a **singleton service pattern** — no Redux or external state management:

1. **`config.ts`** — Module-level singleton. `configureAuthentication()` stores config and creates the service. `getConfig()`/`getService()` retrieve them (throw if uninitialized). Exports `setConfig`/`setService` for test mocking only.

2. **`service.ts`** — `makeAuthenticationService<User>()` creates a pub/sub store holding `{ currentUser, isLoggedIn }`. Components subscribe via the hooks; the service notifies subscribers on login/logout.

3. **`actions.ts`** — `login()`, `current()`, `logout()` — async functions that call the backend via `authFetch` and update the service. Login uses POST, current uses GET, logout uses DELETE (all to URLs from config).

4. **`utils.ts`** — `authFetch()` wraps `fetch` with `credentials: 'same-origin'`, auto-injects `X-XSRF-TOKEN` header on non-GET requests, and auto-logs out on 401. `authInterceptor()` does the same for Axios error responses.

5. **`hooks.tsx`** — `useAuthentication()` subscribes to the service via `useEffect`. `useCurrentUser()` throws if not logged in. `useIsLoggedIn()` returns a boolean.

6. **`provider.tsx`** — `AuthenticationProvider` + `AuthenticationContext` wraps the service state in React Context for consumers who prefer context over direct hook usage.

7. **`routeguards/`** — `IsAuthenticated` redirects to `loginRoute` if not logged in. `IsAuthorized` additionally checks an `authorizer` callback and redirects to `dashboardRoute` if unauthorized. Both support react-router `<Outlet />` for nested routes.

## Testing Patterns

- Tests live in `tests/` mirroring `src/` structure
- Vitest with jsdom environment, globals enabled (`vitest.config.ts`)
- Tests mock `global.fetch` directly and mock `getService` via `vi.spyOn(config, 'getService')`
- Async tests use `expect.assertions(n)` by convention
- Component tests use `@testing-library/react` with `MemoryRouter` from react-router
- `@testing-library/jest-dom/vitest` matchers loaded via `setupTests.ts`

## Code Style

- Prettier: single quotes, no trailing commas, double quotes in JSX
- ESLint: TypeScript strict, react-hooks plugin, vitest plugin
- Husky pre-commit hook runs lint-staged (prettier on `{src,tests}/**`)
- TypeScript strict mode with `noUnusedLocals`, `noImplicitReturns`
