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
    text: "Verify Your Email Address",
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
    text: "Thank you for signing up! Please verify your email address by clicking the button below:",
  },
  {
    as: "a",
    class: JSON.stringify({
      "": {
        "background-color": "primary",
        border: "none",
        "border-radius": "4",
        color: "base-5",
        cursor: "pointer",
        display: "inline-block",
        "margin-bottom": "16",
        padding: "8 16",
        "text-decoration": "none",
      },
      ":hover": {
        opacity: "0.9",
      },
    }),
    componentName: "Html",
    pos: 3,
    props: `return {
      href: args.searchParams.url,
    }`,
    target: "_blank",
    text: "Verify Email Address",
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        color: "base",
        "margin-bottom": "16",
      },
    }),
    componentName: "Html",
    pos: 4,
    text: "This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.",
  },
];

export const signupEmailVerificationForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent during the signup process to verify the user's email address, containing a verification link valid for 24 hours",
  key: "SignupEmailVerification",
  title: "Verify Your Email Address",
};
