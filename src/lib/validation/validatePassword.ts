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
