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
    text: "Your Verification Code"
  },
  {
    as: "p",
    class: {
      '': {
        'margin-bottom': '16'
      }
    },
    componentName: "Html",
    text: "Use the following code to verify your account:"
  },
  {
    as: "div",
    attributes: [
      {
        as: "p",
        class: {
          '': {
            'font-size': '32px',
            'font-weight': 'bold',
            'letter-spacing': '4px'
          }
        },
        componentName: "Html",
        text: "123456"
      }
    ],
    class: {
      '': {
        'background-color': 'base-5',
        'border-radius': '4',
        'margin-bottom': '24',
        'padding': '16',
        'text-align': 'center'
      }
    },
    componentName: "Html"
  },
  {
    as: "p",
    class: {
      '': {
        'color': 'base-20'
      }
    },
    componentName: "Html",
    text: "This code will expire in 10 minutes."
  }
];

export const verificationCodeForm = {attributes: [createEmailTemplate(content)], key: "VerificationCode"}