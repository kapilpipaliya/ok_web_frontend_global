export function validateEmail(email: string) {
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed || !emailRegex.test(trimmed)) {
    return "Please enter a valid email address";
  }
  return undefined;
}
