import { createEmailTemplate } from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: JSON.stringify({
      "": {
        "font-size": "24px",
        "font-weight": "bold",
        "margin-bottom": "16",
      },
    }),
    componentName: "Html",
    pos: 1,
    text: "Reset Your Password",
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        "margin-bottom": "16",
      },
    }),
    componentName: "Html",
    pos: 2,
    text: "We received a request to reset your password. Please use the following verification code to complete the process:",
  },
  {
    as: "div",
    attributes: [
      {
        as: "p",
        class: JSON.stringify({
          "": {
            "font-size": "32px",
            "font-weight": "bold",
            "letter-spacing": "4px",
          },
        }),
        componentName: "Html",
        pos: 1,
        props: `return {
            text: args.searchParams.otp,
          }`,
      },
    ],
    class: JSON.stringify({
      "": {
        "background-color": "base-5",
        "border-radius": "4",
        "margin-bottom": "24",
        padding: "16",
        "text-align": "center",
      },
    }),
    componentName: "Html",
    pos: 3,
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        color: "base",
      },
    }),
    componentName: "Html",
    pos: 4,
    text: "This code will expire in 10 minutes. If you didn't request this password reset, please ignore this email or contact support if you have concerns.",
  },
];

export const passwordResetForm = {
  attributes: [createEmailTemplate(content)],
  key: "PasswordReset",
  title: "Reset Your Password",
  description: "Sent when users request a password reset, containing a verification code valid for 10 minutes",

};
