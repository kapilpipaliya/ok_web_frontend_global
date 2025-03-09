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
    text: "Account Deletion Request",
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
    text: "We've received a request to delete your account. Your account will be scheduled for deletion and will be permanently removed after 48 hours from now.",
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
    text: "During this 48-hour period, you will no longer be able to log in to your account. If you change your mind, please contact our support team immediately to cancel the deletion process.",
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        "margin-bottom": "16",
      },
    }),
    componentName: "Html",
    pos: 4,
    text: "Please note that once your account is deleted, all your data will be permanently removed and cannot be recovered.",
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
        "margin-top": "16",
        padding: "8 16",
        "text-decoration": "none",
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

export const accountDeletionRequestForm = {
  attributes: [createEmailTemplate(content)],
  key: "AccountDeletionRequest",
  title: "Account Deletion Request",
  description: "Sent when a user requests to delete their account, explaining the 48-hour deletion process and providing support contact information",

};
