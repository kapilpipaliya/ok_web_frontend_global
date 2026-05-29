import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

const content = [
  {
    as: "h1",
    css: `return \`._id {
      color: \${args.theme.var.color.text_hex};
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 1,
    text: "Confirm Your Email Address",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.text_hex};
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "Thank you for signing up! Please confirm your email address to activate your account.",
  },
  {
    as: "a",
    css: `return \`._id {
      background-color: \${args.theme.var.color.primary_hex};
      border: none;
      border-radius: 4px;
      color: \${args.theme.var.color.primary_text_hex};
      cursor: pointer;
      display: inline-block;
      margin-bottom: 16px;
      padding: 8px 16px;
      text-decoration: none;
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
    props: `return {
      href: args.searchParams.url,
    }`,
    target: "_blank",
    text: "Confirm Email",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.text_hex};
    }\`;`,
    componentName: "Html",
    displayOrder: 4,
    text: "If you didn't create an account, you can safely ignore this email.",
  },
];

export const signupConfirmationForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Initial email sent after user signup to confirm their email address",
  key: "SignupConfirmation",
  title: "Confirm Your Email Address",
};
