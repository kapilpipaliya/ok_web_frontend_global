import {createEmailTemplate} from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: "font-size:24px font-weight:bold mb:16",
    componentName: "Html",
    text: "Password Changed Successfully"
  },
  {
    as: "p",
    class: "mb:24",
    componentName: "Html",
    text: "Your password has been successfully changed. If you did not make this change, please contact our support team immediately."
  },
  {
    as: "button",
    class: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
    componentName: "Html",
    text: "Contact Support"
  }
];
export const passwordChangedForm = {attributes: [createEmailTemplate(content)], key: "PasswordChanged"}