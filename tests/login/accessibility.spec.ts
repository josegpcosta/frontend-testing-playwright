import { test, expect } from '../fixtures/pages.fixture';
import { runAccessibilityScan } from '../utils/accessibility-scan';
import { keyboardLoginUser, unregisteredUser } from '../fixtures/test-data';

test.describe('Sign In - Accessibility', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('All form inputs have associated labels', async ({ loginPage }) => {
    expect(await loginPage.labelTextOf(loginPage.emailInput), 'email label').not.toBe('');

    // The password field only exists after the email step.
    await loginPage.submitEmail(keyboardLoginUser.email);
    await expect(loginPage.passwordInput).toBeVisible();
    expect(await loginPage.labelTextOf(loginPage.passwordInput), 'password label').not.toBe('');
  });

  test('Form is navigable via keyboard only', async ({ page, loginPage }) => {
    // Step 1: email
    await loginPage.emailInput.focus();
    await page.keyboard.type(keyboardLoginUser.email);
    await expect(loginPage.emailInput).toHaveValue(keyboardLoginUser.email);
    expect(await loginPage.tabUntilFocused(loginPage.submitButton), 'submit reachable via Tab').toBe(true);
    await page.keyboard.press('Enter');

    // Step 2: password
    await expect(loginPage.passwordInput).toBeVisible();
    await loginPage.passwordInput.focus();
    await page.keyboard.type(keyboardLoginUser.password);
    expect(await loginPage.tabUntilFocused(loginPage.submitButton), 'submit reachable via Tab').toBe(true);
    await page.keyboard.press('Enter');

    // The form was submitted using the keyboard only.
    await expect(loginPage.invalidCredentialsError).toBeVisible();
  });

  test('Login errors are announced to screen readers', async ({ loginPage }) => {
    await loginPage.login(unregisteredUser);

    await expect(loginPage.invalidCredentialsAlert).toBeAttached();
  });

  test('Page has no accessibility violations (WCAG)', async ({ page }) => {
    await runAccessibilityScan(page);
  });
});
