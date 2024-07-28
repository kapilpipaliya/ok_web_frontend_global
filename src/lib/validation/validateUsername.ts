export function validateUsername(username: string) {
  if (username.length < 3) {
    return "Please enter a valid username";
  }
  return undefined; // No error, email is valid
}
