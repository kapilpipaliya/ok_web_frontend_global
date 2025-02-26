import {createEmailTemplate} from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: {
      '': {
        'font-size': '24px',
        'font-weight': 'bold',
        'margin-bottom': '16'
      }
    },
    componentName: "Html",
    text: "Password Changed Successfully"
  },
  {
    as: "p",
    class: {
      '': {
        'margin-bottom': '24'
      }
    },
    componentName: "Html",
    text: "Your password has been successfully changed. If you did not make this change, please contact our support team immediately."
  },
  {
    as: "button",
    class: {
      '': {
        'background-color': 'primary',
        'border': 'none',
        'border-radius': '4',
        'color': 'base-5',
        'cursor': 'pointer',
        'padding': '8 16'
      },
      ':hover': {
        'opacity': '0.9'
      }
    },
    componentName: "Html",
    text: "Contact Support"
  }
];

export const passwordChangedForm = {attributes: [createEmailTemplate(content)], key: "PasswordChanged"}