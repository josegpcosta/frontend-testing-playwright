import { test, expect } from '../fixtures/pages.fixture';
import { SignUpPage } from '../pages/SignUpPage';
import {
  ALLOW_REAL_SIGNUP,
  validSignUpData,
  invalidSignUpEmail,
  passwordAtMinLength,
  passwordBelowMinLength,
  nameOfLength,
  PASSWORD_MIN_LENGTH,
  FIRST_NAME_MAX_LENGTH,
  FIRST_NAME_MIN_LENGTH,
} from '../fixtures/test-data';

/**
 * The email is invalid on purpose: its error proves that validation ran,
 * and no real account is created on each run.
 */
const dataThatStaysOnForm = () => ({ ...validSignUpData(), email: invalidSignUpEmail });

test.describe('Sign Up - E2E', () => {
  test.beforeEach(async ({ signUpPage }) => {
    await signUpPage.goto();
  });

  // ------------------------------
  // Functional Tests
  // ------------------------------
  test('Sign up with valid email and strong password', async ({ signUpPage }) => {
    test.skip(!ALLOW_REAL_SIGNUP, 'Creates a real account. Set E2E_ALLOW_SIGNUP=true to run');

    await signUpPage.signUp(validSignUpData());

    // The route stays /sign-up after submitting, so success means the form is replaced.
    // If validation fails, the form stays and this assertion fails.
    await expect(signUpPage.firstNameInput).toBeHidden();
  });

  test('Sign up with invalid email format', async ({ signUpPage }) => {
    await signUpPage.signUp(dataThatStaysOnForm());

    await expect(signUpPage.invalidEmailError).toBeVisible();
  });

  // ------------------------------
  // Boundary Value Analysis
  // ------------------------------
  // The password length rule is an always-visible checklist item.
  // What changes is its state (met / not met), not its visibility.
  test(`Password length at minimum allowed value (${PASSWORD_MIN_LENGTH})`, async ({ signUpPage }) => {
    expect(passwordAtMinLength).toHaveLength(PASSWORD_MIN_LENGTH);

    await signUpPage.signUp({ ...dataThatStaysOnForm(), password: passwordAtMinLength });

    await expect(signUpPage.invalidEmailError).toBeVisible();
    await expect(signUpPage.passwordLengthRequirement).toHaveClass(SignUpPage.REQUIREMENT_MET);
  });

  test(`Password length just below minimum (${PASSWORD_MIN_LENGTH - 1})`, async ({ signUpPage }) => {
    expect(passwordBelowMinLength).toHaveLength(PASSWORD_MIN_LENGTH - 1);

    await signUpPage.signUp({ ...dataThatStaysOnForm(), password: passwordBelowMinLength });

    await expect(signUpPage.invalidEmailError).toBeVisible();
    await expect(signUpPage.passwordLengthRequirement).not.toHaveClass(SignUpPage.REQUIREMENT_MET);
  });

  // First name: valid range is FIRST_NAME_MIN_LENGTH..FIRST_NAME_MAX_LENGTH.
  // The input accepts any length; the rule is validated on submit and flagged via aria-invalid.
  // Name-like data avoids tripping other rules that would mask the length rule.
  // The field's error text is added to the "valid" assertions, so a failure shows the real rule.
  test(`First Name field just below minimum (${FIRST_NAME_MIN_LENGTH - 1})`, async ({ signUpPage }) => {
    await signUpPage.signUp({ ...dataThatStaysOnForm(), firstName: nameOfLength(FIRST_NAME_MIN_LENGTH - 1) });

    await expect(signUpPage.invalidEmailError).toBeVisible();
    await expect(signUpPage.firstNameInput).toHaveAttribute('aria-invalid', 'true');
    expect(await signUpPage.describedByText(signUpPage.firstNameInput)).toContain(
      `at least ${FIRST_NAME_MIN_LENGTH} characters`
    );
  });

  test(`First Name field at minimum allowed length (${FIRST_NAME_MIN_LENGTH})`, async ({ signUpPage }) => {
    const atMin = nameOfLength(FIRST_NAME_MIN_LENGTH);

    await signUpPage.signUp({ ...dataThatStaysOnForm(), firstName: atMin });

    await expect(signUpPage.invalidEmailError).toBeVisible();
    await expect(signUpPage.firstNameInput).toHaveValue(atMin);
    const error = await signUpPage.describedByText(signUpPage.firstNameInput);
    await expect(signUpPage.firstNameInput, `first name error: "${error}"`).not.toHaveAttribute('aria-invalid', 'true');
  });

  test(`First Name field at maximum allowed length (${FIRST_NAME_MAX_LENGTH})`, async ({ signUpPage }) => {
    const atMax = nameOfLength(FIRST_NAME_MAX_LENGTH);

    await signUpPage.signUp({ ...dataThatStaysOnForm(), firstName: atMax });

    await expect(signUpPage.invalidEmailError).toBeVisible();
    await expect(signUpPage.firstNameInput).toHaveValue(atMax);
    const error = await signUpPage.describedByText(signUpPage.firstNameInput);
    await expect(signUpPage.firstNameInput, `first name error: "${error}"`).not.toHaveAttribute('aria-invalid', 'true');
  });

  test(`First Name field just above maximum (${FIRST_NAME_MAX_LENGTH + 1})`, async ({ signUpPage }) => {
    await signUpPage.signUp({ ...dataThatStaysOnForm(), firstName: nameOfLength(FIRST_NAME_MAX_LENGTH + 1) });

    await expect(signUpPage.invalidEmailError).toBeVisible();
    await expect(signUpPage.firstNameInput).toHaveAttribute('aria-invalid', 'true');
    expect(await signUpPage.describedByText(signUpPage.firstNameInput)).toContain(
      `at most ${FIRST_NAME_MAX_LENGTH} characters`
    );
  });
});
