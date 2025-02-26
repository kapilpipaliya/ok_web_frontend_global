import {createEmailTemplate} from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: "font-size:24px font-weight:bold mb:16",
    componentName: "Html",
    text: "Two-Factor Authentication Code"
  },
  {
    as: "p",
    class: "mb:16",
    componentName: "Html",
    text: "Here is your two-factor authentication code:"
  },
  {
    as: "div",
    attributes: [
      {
        as: "p",
        class: "font-size:32px font-weight:bold letter-spacing:4px",
        componentName: "Html",
        text: "847291"
      }
    ],
    class: "bg:base-2 p:16 text-align:center mb:24 r:4",
    componentName: "Html"
  },
  {
    as: "p",
    class: "color:grey",
    componentName: "Html",
    text: "This code will expire in 5 minutes. Do not share this code with anyone."
  }
];
export const twoFactorAuthForm = {attributes: [createEmailTemplate(content)], key: "TwoFactorAuth"}