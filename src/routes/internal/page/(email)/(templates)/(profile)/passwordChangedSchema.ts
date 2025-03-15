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
    text: "Password Changed Successfully",
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        "margin-bottom": "24",
      },
    }),
    componentName: "Html",
    pos: 2,
    text: "Your password has been successfully changed. If you did not make this change, please contact our support team immediately.",
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
    pos: 3,
    props: `return {
      href: "${typeof window !== "undefined" ? window.location.origin : ""}/support/contact"
    }`,
    target: "_blank",
    text: "Contact Support",
  },
];

export const passwordChangedForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Notification sent after a user's password has been successfully changed",
  key: "PasswordChanged",
  title: "Password Changed Successfully",
};
