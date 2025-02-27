import { createEmailTemplate } from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: JSON.stringify({
      "": {
        "font-size": "24px",
        "font-weight": "bold",
        "margin-bottom": "16",
      },
    }),
    componentName: "Html",
    pos: 1,
    text: "Test Email",
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        "margin-bottom": "16",
      },
    }),
    componentName: "Html",
    pos: 2,
    text: "This is a test email to verify that your email configuration is working correctly.",
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        color: "primary",
      },
    }),
    componentName: "Html",
    pos: 3,
    text: "If you received this email, your email settings are configured properly.",
  },
];

export const testEmailForm = {
  attributes: [createEmailTemplate(content)],
  key: "TestEmail",
  title: "Test Email",
};
