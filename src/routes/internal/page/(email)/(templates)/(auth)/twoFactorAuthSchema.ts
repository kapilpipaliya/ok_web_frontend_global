import {createEmailTemplate} from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: JSON.stringify({
      '': {
        'font-size': '24px',
        'font-weight': 'bold',
        'margin-bottom': '16'
      }
    }),
    componentName: "Html",
    pos: 1,
    text: "Two-Factor Authentication Code"
  },
  {
    as: "p",
    class: JSON.stringify({
      '': {
        'margin-bottom': '16'
      }
    }),
    componentName: "Html",
    pos: 2,
    text: "Here is your two-factor authentication code:"
  },
  {
    as: "div",
    attributes: [
      {
        as: "p",
        class: JSON.stringify({
          '': {
            'font-size': '32px',
            'font-weight': 'bold',
            'letter-spacing': '4px'
          }
        }),
        componentName: "Html",
        pos: 1,
        text: "847291"
      }
    ],
    class: JSON.stringify({
      '': {
        'background-color': 'base-5',
        'border-radius': '4',
        'margin-bottom': '24',
        'padding': '16',
        'text-align': 'center'
      }
    }),
    componentName: "Html",
    pos: 3
  },
  {
    as: "p",
    class: JSON.stringify({
      '': {
        'color': 'base'
      }
    }),
    componentName: "Html",
    pos: 4,
    text: "This code will expire in 5 minutes. Do not share this code with anyone."
  }
];

export const twoFactorAuthForm = {attributes: [createEmailTemplate(content)], key: "TwoFactorAuth", title: "Two-Factor Authentication Code"}