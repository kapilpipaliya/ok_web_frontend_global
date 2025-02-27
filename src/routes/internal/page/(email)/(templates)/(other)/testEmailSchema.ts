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
    text: "Test Email"
  },
  {
    as: "p",
    class: {
      '': {
        'margin-bottom': '16'
      }
    },
    componentName: "Html",
    text: "This is a test email to verify that your email configuration is working correctly."
  },
  {
    as: "p",
    class: {
      '': {
        'color': 'primary'
      }
    },
    componentName: "Html",
    text: "If you received this email, your email settings are configured properly."
  }
];

export const testEmailForm = {attributes: [createEmailTemplate(content)], key: "TestEmail"}