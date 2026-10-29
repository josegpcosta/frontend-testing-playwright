export type Credentials = {
  email: string;
  password: string;
};

export type SignUpData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

// ------------------------------
// Sign in
// ------------------------------

/**
 * A real account is required to assert a successful login.
 * Provide it via E2E_USER_EMAIL and E2E_USER_PASSWORD; the test is skipped otherwise.
 */
export const registeredUser: Credentials = {
  email: process.env.E2E_USER_EMAIL ?? '',
  password: process.env.E2E_USER_PASSWORD ?? '',
};

export const unregisteredUser: Credentials = {
  email: 'unknown@site.com',
  password: 'correctPass1',
};

export const emptyFields: Credentials = {
  email: '',
  password: '',
};

export const invalidEmailFormat: Credentials = {
  email: 'invalidEmail',
  password: 'correctPass1',
};

export const keyboardLoginUser: Credentials = {
  email: 'valid@site.com',
  password: 'password123',
};

// ------------------------------
// Sign up
// ------------------------------

/** Submitting a fully valid sign-up creates a real account, so it is opt-in. */
export const ALLOW_REAL_SIGNUP = process.env.E2E_ALLOW_SIGNUP === 'true';

export const PASSWORD_MIN_LENGTH = 12;
// Confirmed against app.ramp.com: "First name must be at least 2 / at most 36 characters".
export const FIRST_NAME_MIN_LENGTH = 2;
export const FIRST_NAME_MAX_LENGTH = 36;

/** Unique per call, so repeated runs do not collide with an existing account. */
export function uniqueEmail(prefix = 'newuser'): string {
  return `${prefix}+${Date.now()}@site.com`;
}

/** A plausible single name of the exact length, starting with a capital letter. */
export function nameOfLength(length: number): string {
  const base = 'Mariaeduardafernandacarolinavalentinabeatrizhelena';
  return base.repeat(Math.ceil(length / base.length)).slice(0, length);
}

/** Valid on every field. Spread it and override one field per scenario. */
export function validSignUpData(): SignUpData {
  return {
    firstName: 'John',
    lastName: 'Costa',
    email: uniqueEmail(),
    password: 'StrongPass123!',
  };
}

/** Same composition (upper, lower, digit, symbol), differing only in length. */
export const passwordAtMinLength = 'StrongPass1!'; // 12 chars
export const passwordBelowMinLength = 'StrongPas1!'; // 11 chars

export const invalidSignUpEmail = 'invalidEmail';
