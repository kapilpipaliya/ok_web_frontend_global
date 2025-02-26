import {createEmailTemplate} from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: "font-size:24px font-weight:bold mb:16",
    componentName: "Html",
    text: "Confirm Your Email Address"
  },
  {
    as: "p",
    class: "mb:16",
    componentName: "Html",
    text: "Thank you for signing up! Please confirm your email address to activate your account."
  },
  {
    as: "button",
    class: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mb:16",
    componentName: "Html",
    text: "Confirm Email"
  },
  {
    as: "p",
    class: "color:grey",
    componentName: "Html",
    text: "If you didn't create an account, you can safely ignore this email."
  }
];
export const signupConfirmationForm = {attributes: [createEmailTemplate(content)], key: "SignupConfirmation"}