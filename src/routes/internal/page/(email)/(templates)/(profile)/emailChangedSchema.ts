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
    text: "Email Change Notification",
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
    text: "We're writing to let you know that a request has been made to change the email address associated with your account.",
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        "margin-bottom": "16",
      },
    }),
    componentName: "Html",
    pos: 3,
    text: "If you initiated this change, no further action is required. The new email address will be activated after verification.",
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        color: "error",
        "font-weight": "bold",
        "margin-bottom": "16",
      },
    }),
    componentName: "Html",
    pos: 4,
    text: "If you did not request this change, please contact our support team immediately.",
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
        padding: "8 16",
        "text-decoration": "none",
        display: "inline-block",
      },
      ":hover": {
        opacity: "0.9",
      },
    }),
    componentName: "Html",
    pos: 5,
    props: `return {
      href: window.location.origin + "/support/contact",
    }`,
    target: "_blank",
    text: "Contact Support",
  },
];

export const emailChangedForm = {
  attributes: [createEmailTemplate(content)],
  key: "EmailChanged",
  title: "Email Change Notification",
};
