import {createEmailTemplate} from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: "font-size:24px font-weight:bold mb:16",
    componentName: "Html",
    text: "Account Deletion Confirmation"
  },
  {
    as: "p",
    class: "mb:16",
    componentName: "Html",
    text: "Your account has been successfully deleted. We're sorry to see you go!"
  },
  {
    as: "p",
    class: "mb:16",
    componentName: "Html",
    text: "If you didn't request this deletion, please contact our support team immediately."
  },
  {
    as: "button",
    class: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
    componentName: "Html",
    text: "Contact Support"
  }
];
export const accountDeletionForm = {attributes: [createEmailTemplate(content)], key: "AccountDeletion"}