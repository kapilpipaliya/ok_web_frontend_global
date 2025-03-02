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
    text: "Welcome to Our Platform!",
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
    text: "We're excited to have you on board. Here are some things you can do to get started:",
  },
  {
    as: "ul",
    attributes: [
      {
        as: "li",
        componentName: "Html",
        pos: 1,
        text: "Complete your profile",
      },
      {
        as: "li",
        componentName: "Html",
        pos: 2,
        text: "Explore our features",
      },
    ],
    class: JSON.stringify({
      "": {
        "margin-bottom": "24",
      },
    }),
    componentName: "Html",
    pos: 3,
  },
  {
    as: "button",
    class: JSON.stringify({
      "": {
        "background-color": "primary",
        border: "none",
        "border-radius": "4",
        color: "base-5",
        cursor: "pointer",
        padding: "8 16",
      },
      ":hover": {
        opacity: "0.9",
      },
    }),
    componentName: "Html",
    pos: 4,
    text: "Get Started",
  },
];

export const welcomeEmailForm = {
  attributes: [createEmailTemplate(content)],
  key: "WelcomeEmail",
  title: "Welcome Email",
};
