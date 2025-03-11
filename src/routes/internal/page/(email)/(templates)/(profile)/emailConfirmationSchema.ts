import { createEmailTemplate } from "~/pages/BaseEmailTemplate";

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
    text: "Confirm Your New Email Address",
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
    text: "Please confirm your new email address by clicking the button below:",
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
    text: "Confirm Email Change",
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
    text: "This link will expire in 24 hours. If you did not request this change, please ignore this email or contact support if you have concerns.",
  },
];

export const emailConfirmationForm = {
  attributes: [createEmailTemplate(content)],
  description: "Sent when users request to change their email address, containing a verification link to confirm the new email",
  key: "EmailConfirmation",
  title: "Confirm Your New Email Address",

};
