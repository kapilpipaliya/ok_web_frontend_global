import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

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
    text: "Your Verification Code",
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
    text: "Use the following code to verify your account:",
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
        text: "123456",
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
    text: "This code will expire in 10 minutes.",
  },
];

export const verificationCodeForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Generic verification code email used for various authentication purposes, valid for 10 minutes",
  key: "VerificationCode",
  title: "Verification Code",
};
