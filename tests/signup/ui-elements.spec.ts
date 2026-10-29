import { test, expect } from '../fixtures/pages.fixture';

test.describe('Sign Up - UI Elements', () => {
  test.beforeEach(async ({ signUpPage }) => {
    await signUpPage.goto();
  });

  test('Page title and header are visible', async ({ page, signUpPage }) => {
    // The sign-up route keeps the generic site title, so the heading identifies the page.
    await expect(page).toHaveTitle(/Ramp/);
    await expect(signUpPage.heading).toBeVisible();
  });

  test('All form fields are visible and enabled', async ({ signUpPage }) => {
    for (const field of signUpPage.formFields) {
      await expect(field).toBeVisible();
      await expect(field).toBeEnabled();
    }
  });

  test('Sign Up button is visible by default', async ({ signUpPage }) => {
    await expect(signUpPage.submitButton).toBeVisible();
  });
});
