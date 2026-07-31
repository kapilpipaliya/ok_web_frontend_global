import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

const content = [
  {
    as: "h1",
    css: `return \`._id {
      color: \${t.var.color.text_hex};
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 1,
    text: "Verify Your Email Address",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${t.var.color.text_hex};
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "Thank you for signing up! Please verify your email address by clicking the button below:",
  },
  {
    as: "a",
    css: `return \`._id {
      background-color: \${t.var.color.primary_hex};
      border: none;
      border-radius: 4px;
      color: \${t.var.color.primary_text_hex};
      cursor: pointer;
      display: inline-block;
      margin-bottom: 16px;
      padding: 8px 16px;
      text-decoration: none;
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
    props: `return {
      href: _.searchParams.url,
    }`,
    target: "_blank",
    text: "Verify Email Address",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${t.var.color.text_hex};
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 4,
    text: "This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.",
  },
];

export const signupEmailVerificationForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent during the signup process to verify the user's email address, containing a verification link valid for 24 hours",
  key: "SignupEmailVerification",
  title: "Verify Your Email Address",
};
