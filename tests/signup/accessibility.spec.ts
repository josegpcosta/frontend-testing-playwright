import { test, expect } from '../fixtures/pages.fixture';
import { runAccessibilityScan } from '../utils/accessibility-scan';
import { validSignUpData, invalidSignUpEmail } from '../fixtures/test-data';

test.describe('Sign Up - Accessibility', () => {
  test.beforeEach(async ({ signUpPage }) => {
    await signUpPage.goto();
  });

  test('All form inputs have associated labels', async ({ signUpPage }) => {
    for (const field of signUpPage.formFields) {
      const name = await field.getAttribute('name');
      expect(await signUpPage.labelTextOf(field), `label for "${name}"`).not.toBe('');
    }
  });

  test('Form is navigable via keyboard only', async ({ page, signUpPage }) => {
    // Invalid email on purpose: proves keyboard submission without creating an account.
    const data = { ...validSignUpData(), email: invalidSignUpEmail };
    const valueByName: Record<string, string> = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
    };

    // Follow the DOM order (the default tab order) and allow other focusable
    // elements, such as icon buttons, between fields.
    const fields = await signUpPage.sortByDomOrder(signUpPage.formFields);
    await fields[0].focus();

    for (const [i, field] of fields.entries()) {
      const name = (await field.getAttribute('name')) ?? '';
      if (i > 0) {
        expect(await signUpPage.tabUntilFocused(field), `"${name}" reachable via Tab`).toBe(true);
      }
      await page.keyboard.type(valueByName[name]);
      await expect(field).toHaveValue(valueByName[name]);
    }

    expect(await signUpPage.tabUntilFocused(signUpPage.submitButton), 'submit reachable via Tab').toBe(true);
    await page.keyboard.press('Enter');

    await expect(signUpPage.invalidEmailError).toBeVisible();
  });

  test('Page has no accessibility violations (WCAG)', async ({ page }) => {
    await runAccessibilityScan(page);
  });
});
