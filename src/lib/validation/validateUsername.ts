export function validateUsername(username: string) {
  if (username.length < 3) {
    return "Please enter a username with at least 3 characters";
  }
  return undefined; // No error, email is valid
}
