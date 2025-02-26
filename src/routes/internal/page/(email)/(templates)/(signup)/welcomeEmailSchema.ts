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
    text: "Welcome to Our Platform!"
  },
  {
    as: "p",
    class: {
      '': {
        'margin-bottom': '16'
      }
    },
    componentName: "Html",
    text: "We're excited to have you on board. Here are some things you can do to get started:"
  },
  {
    as: "ul",
    attributes: [
      {
        as: "li",
        componentName: "Html",
        text: "Complete your profile"
      },
      {
        as: "li",
        componentName: "Html",
        text: "Explore our features"
      },
      {
        as: "li",
        componentName: "Html",
        text: "Connect with others"
      }
    ],
    class: {
      '': {
        'margin-bottom': '24'
      }
    },
    componentName: "Html"
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
    text: "Get Started"
  }
];

export const welcomeEmailForm = {attributes: [createEmailTemplate(content)], key: "WelcomeEmail"}