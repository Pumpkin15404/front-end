export interface LoginFormValues {
  email: string;
  password: string;
}

export interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();

  if (!trimmed) {
    return 'Vui lòng nhập email';
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Email không đúng định dạng';
  }

  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Vui lòng nhập mật khẩu';
  }

  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  return undefined;
}

export function validateLoginForm(values: LoginFormValues): FieldErrors {
  const errors: FieldErrors = {};

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(values.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}
