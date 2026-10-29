import { test, expect } from '../fixtures/pages.fixture';
import {
  registeredUser,
  unregisteredUser,
  emptyFields,
  invalidEmailFormat,
} from '../fixtures/test-data';

test.describe('Login - E2E', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ------------------------------
  // Functional Tests
  // ------------------------------
  test('Submitting an email advances to the password step', async ({ loginPage }) => {
    await expect(loginPage.passwordInput).toBeHidden();

    await loginPage.submitEmail(unregisteredUser.email);

    await expect(loginPage.passwordInput).toBeVisible();
  });

  test('Login with valid credentials', async ({ page, loginPage }) => {
    test.skip(
      !registeredUser.email || !registeredUser.password,
      'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run this test'
    );

    await loginPage.login(registeredUser);

    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(loginPage.invalidCredentialsError).toBeHidden();
  });

  test('Attempt login with empty fields', async ({ loginPage }) => {
    await loginPage.submitEmail(emptyFields.email);

    // "(required)" is a permanent label suffix, not an error, so it proves nothing here.
    // The design system flags the field itself through aria-invalid.
    await expect(loginPage.emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(loginPage.passwordInput).toBeHidden();
  });

  test('Attempt login with unregistered email', async ({ loginPage }) => {
    await loginPage.login(unregisteredUser);

    await expect(loginPage.invalidCredentialsError).toBeVisible();
  });

  test('Attempt login with invalid email format', async ({ loginPage }) => {
    await loginPage.submitEmail(invalidEmailFormat.email);

    // Native HTML5 validation: the message lives in the browser tooltip, not in the DOM.
    expect(await loginPage.isValid(loginPage.emailInput)).toBe(false);
    expect(await loginPage.validationMessageOf(loginPage.emailInput)).toContain("'@'");
    await expect(loginPage.passwordInput).toBeHidden();
  });
});
