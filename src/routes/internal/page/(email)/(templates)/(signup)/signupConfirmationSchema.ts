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
    text: "Confirm Your Email Address",
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
    text: "Thank you for signing up! Please confirm your email address to activate your account.",
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
        "margin-bottom": "16",
        padding: "8 16",
        "text-decoration": "none",
        display: "inline-block",
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
    text: "Confirm Email",
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
    text: "If you didn't create an account, you can safely ignore this email.",
  },
];

export const signupConfirmationForm = {
  attributes: [createEmailTemplate(content)],
  key: "SignupConfirmation",
  title: "Confirm Your Email Address",
};
