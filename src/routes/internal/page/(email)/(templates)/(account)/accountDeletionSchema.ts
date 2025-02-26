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
    text: "Account Deletion Confirmation"
  },
  {
    as: "p",
    class: {
      '': {
        'margin-bottom': '16'
      }
    },
    componentName: "Html",
    text: "Your account has been successfully deleted. We're sorry to see you go!"
  },
  {
    as: "p",
    class: {
      '': {
        'margin-bottom': '16'
      }
    },
    componentName: "Html",
    text: "If you didn't request this deletion, please contact our support team immediately."
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

export const accountDeletionForm = {attributes: [createEmailTemplate(content)], key: "AccountDeletion"}