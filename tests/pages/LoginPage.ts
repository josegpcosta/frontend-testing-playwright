import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Credentials } from '../fixtures/test-data';

const INVALID_CREDENTIALS_TEXT =
  'We do not recognize this email password combination. Try again or reset your password.';

export class LoginPage extends BasePage {
  protected readonly path = '/sign-in';
  protected readonly readyIndicator: Locator;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly invalidCredentialsError: Locator;
  readonly invalidCredentialsAlert: Locator;

  constructor(page: Page) {
    super(page);
    const main = page.getByRole('main');

    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.readyIndicator = this.emailInput;

    // Scoped to <main>: the same text is repeated in a
    // screen-reader-only live region (role="alert") outside of it.
    this.invalidCredentialsError = main.getByText(INVALID_CREDENTIALS_TEXT);

    /** Screen-reader-only announcement of the same error. */
    this.invalidCredentialsAlert = page.getByRole('alert').filter({ hasText: INVALID_CREDENTIALS_TEXT });
  }

  /** Step 1 of the sign-in flow. */
  async submitEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  /** Step 2 of the sign-in flow, shown after a valid email is submitted. */
  async submitPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async login({ email, password }: Credentials): Promise<void> {
    await this.submitEmail(email);
    await this.submitPassword(password);
  }
}
