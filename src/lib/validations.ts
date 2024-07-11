export function validatePassword(password: any) {
  const conditions = [
    {
      message: "Passwords must be at least 8 characters long.",
      regex: /.{8,}/,
    },
    {
      message: "Password must include at least one uppercase letter.",
      regex: /[A-Z]/,
    },
    {
      message: "Password must include at least one lowercase letter.",
      regex: /[a-z]/,
    },
    { message: "Password must include at least one number.", regex: /[0-9]/ },
    {
      message: "Password must include at least one special character.",
      regex: /[!@#$%^&*(),.?":{}|<>]/,
    },
  ];

  for (const condition of conditions) {
    if (!condition.regex.test(password)) {
      return condition.message;
    }
  }

  return undefined; // No errors, password is valid
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return undefined; // No error, email is valid
}

export function validateUsername(username: string) {
  if (username.length < 3) {
    return "Please enter a valid username";
  }
  return undefined; // No error, email is valid
}
