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
    text: "Email Change Successful",
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
    text: "Your email address has been successfully updated. This is now your primary email for account notifications and communications.",
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
    text: "If you need to make any additional changes to your account, please visit your account settings.",
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
        padding: "8 16",
        "text-decoration": "none",
      },
      ":hover": {
        opacity: "0.9",
      },
    }),
    componentName: "Html",
    pos: 4,
    props: `return {
      // href: window.location.origin + "/admin/UserSettings",
      href: window.location.origin
    }`,
    target: "_blank",
    text: "Go to Account Settings",
  },
];

export const emailChangeSuccessfulForm = {
  attributes: [createEmailTemplate(content)],
  key: "EmailChangeSuccessful",
  title: "Email Change Successful",
};
