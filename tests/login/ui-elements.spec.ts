import { test, expect } from '../fixtures/pages.fixture';

test.describe('Login - UI Elements', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Page title is visible', async ({ page }) => {
    await expect(page).toHaveTitle(/Ramp Login Page/);
  });

  test('Email field is visible and enabled', async ({ loginPage }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.emailInput).toBeEnabled();
  });

  test('Login button is visible by default', async ({ loginPage }) => {
    await expect(loginPage.submitButton).toBeVisible();
  });
});
