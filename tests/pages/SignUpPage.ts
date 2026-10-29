import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { SignUpData } from '../fixtures/test-data';

export class SignUpPage extends BasePage {
  protected readonly path = '/sign-up';
  protected readonly readyIndicator: Locator;

  /** Class applied by the design system when a password requirement is met (green). */
  static readonly REQUIREMENT_MET = /RyuText--color-constructive/;

  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  readonly invalidEmailError: Locator;
  /** Item of the password checklist. Always visible; its color shows whether it is met. */
  readonly passwordLengthRequirement: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Create account' });
    this.firstNameInput = page.locator('input[name="first_name"]');
    this.lastNameInput = page.locator('input[name="last_name"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.readyIndicator = this.firstNameInput;

    this.invalidEmailError = page.getByText('Invalid email address');
    this.passwordLengthRequirement = page.getByText('At least 12 characters');
  }

  /** Form fields. Use sortByDomOrder() when the tab order matters. */
  get formFields(): Locator[] {
    return [this.firstNameInput, this.lastNameInput, this.emailInput, this.passwordInput];
  }

  /** Fills only the fields present in data, so tests can leave fields empty on purpose. */
  async fillForm(data: Partial<SignUpData>): Promise<void> {
    if (data.firstName !== undefined) await this.firstNameInput.fill(data.firstName);
    if (data.lastName !== undefined) await this.lastNameInput.fill(data.lastName);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.password !== undefined) await this.passwordInput.fill(data.password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async signUp(data: Partial<SignUpData>): Promise<void> {
    await this.fillForm(data);
    await this.submit();
  }
}
