# frontend-testing-playwright

Playwright E2E test suite for the **Ramp** sign-in and sign-up flows: UI checks, functional E2E checks, boundary value analysis, and accessibility checks with `axe-core`.

> **Note**
> By default these tests run against `https://app.ramp.com`, a real external environment. Override it with `BASE_URL`.

## Tech stack

- [Playwright Test](https://playwright.dev/docs/test-intro)
- TypeScript
- [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)

## Project structure

```text
.
├─ playwright.config.ts           # baseURL (env override), locale, reporter, projects
├─ tsconfig.json                  # Used by `npm run typecheck`
└─ tests/
   ├─ pages/                      # Page Objects
   │  ├─ BasePage.ts              # goto(), label/validation/focus helpers
   │  ├─ LoginPage.ts             # /sign-in locators + two-step login actions
   │  └─ SignUpPage.ts            # /sign-up locators + form actions
   ├─ fixtures/
   │  ├─ pages.fixture.ts         # test.extend: injects loginPage / signUpPage
   │  └─ test-data.ts             # Test data, boundaries, data builders
   ├─ utils/
   │  └─ accessibility-scan.ts    # Axe scan + assertion
   ├─ login/                      # ui-elements / e2e / accessibility specs
   └─ signup/                     # ui-elements / e2e / accessibility specs
```

## Design: Page Object Model with fixtures

Each page has a class that owns its locators and user actions. Specs never use raw selectors.

```ts
// LoginPage.ts
async login({ email, password }: Credentials) {
  await this.submitEmail(email);
  await this.submitPassword(password);
}
```

Page objects are injected through Playwright fixtures, so specs import `test` and `expect` from `fixtures/pages.fixture.ts` instead of `@playwright/test`:

```ts
import { test, expect } from '../fixtures/pages.fixture';

test('Attempt login with unregistered email', async ({ loginPage }) => {
  await loginPage.login(unregisteredUser);
  await expect(loginPage.invalidCredentialsError).toBeVisible();
});
```

Conventions:

- Page objects expose locators and actions. Assertions stay in the specs.
- Navigation is explicit in `beforeEach` (`await loginPage.goto()`). `goto()` waits for a page-specific ready element, because the SPA renders after the load event. If the page never renders, the error names the URL and title instead of failing later on a random locator.
- Test data lives in `test-data.ts`. Sign-up data is built with `validSignUpData()` and one field is overridden per scenario.
- Boundary tests cover both sides of each limit: password 11/12 chars, first name 1/2 and 36/37 chars (rules confirmed against app.ramp.com).
- Password length is an always-visible checklist item. Tests assert its state (met / not met), not its visibility.
- Field validation is checked through `aria-invalid`, which the design system sets on submit. This does not depend on error copy.
- When a validation assertion fails, its message includes the field's `aria-describedby` text, so the report shows the real rule.
- First name boundary data uses name-like strings (`nameOfLength`), so other rules such as repeated characters do not mask the length rule.
- The "(required)" text is a permanent label suffix, not an error, so tests do not use it.
- Sign-up boundary tests submit with an invalid email on purpose. The email error proves validation ran, and no account is created.
- The fully valid sign-up creates a real account, so it only runs with `E2E_ALLOW_SIGNUP=true`.
- The keyboard test follows the DOM order of the fields and allows other focusable elements between them.
- Sign-in error messages are scoped to `<main>`, because the same text is repeated in a screen-reader-only live region. That live region has its own accessibility test.
- The axe scan runs WCAG 2.0/2.1 A and AA rules only (`WCAG_TAGS`). Best-practice rules are excluded.

To add a page: create a class in `tests/pages/` extending `BasePage`, set `path`, declare locators and actions, then register it in `pages.fixture.ts`.

## Setup

```bash
npm ci
npx playwright install
```

## Running the tests

```bash
npm test               # headless
npm run test:ui        # UI mode
npm run test:headed    # headed
npm run typecheck      # TypeScript check, no browser needed
```

### Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `BASE_URL` | Target environment | `https://app.ramp.com` |
| `E2E_USER_EMAIL` | Real account for the successful login test | unset (test is skipped) |
| `E2E_USER_PASSWORD` | Password for that account | unset (test is skipped) |
| `E2E_ALLOW_SIGNUP` | Runs the valid sign-up test (creates a real account) | unset (test is skipped) |
| `WORKERS` | Parallel workers (kept low: the target is production) | `2` |
| `CI` | 2 retries instead of 1 (retried tests show as flaky in the report) | unset |

```bash
BASE_URL=https://staging.example.com E2E_USER_EMAIL=me@company.com E2E_USER_PASSWORD=*** npm test
```

## Reports

```bash
npx playwright show-report
```

## Troubleshooting

- **Tests fail due to UI changes**: update the locator in the matching page object only.
- **Accessibility scan fails**: the assertion message lists each violation id, impact and affected node count.
- **Invalid email (login) fails on a non-English browser**: the native validation message is localized. The config forces `locale: 'en-US'`.
