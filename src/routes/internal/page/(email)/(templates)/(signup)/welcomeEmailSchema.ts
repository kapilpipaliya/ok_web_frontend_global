import { css } from "~/lib/styles";
import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

const content = [
  {
    as: "h1",
    css: css`
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 1,
    text: "Welcome to Our Platform!",
  },
  {
    as: "p",
    css: css`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 2,
    text: "We're excited to have you on board. Here are some things you can do to get started:",
  },
  {
    as: "ul",
    attributes: [
      {
        as: "li",
        componentName: "Html",
        pos: 1,
        text: "Complete your profile",
      },
      {
        as: "li",
        componentName: "Html",
        pos: 2,
        text: "Explore our features",
      },
    ],
    css: css`
      margin-bottom: 24px;
    `,
    componentName: "Html",
    pos: 3,
  },
  {
    as: "a",
    css: css`
      background-color: \${args.theme.var.color.primary};
      border: none;
      border-radius: 4px;
      color: \${args.theme.var.color.base_10};
      cursor: pointer;
      display: inline-block;
      padding: 8px 16px;
      text-decoration: none;
      &:hover {
        opacity: 0.9;
      }
    `,
    componentName: "Html",
    pos: 4,
    props: `return {
      href: "${typeof window !== "undefined" ? window.location.origin : ""}/admin/"
    }`,
    target: "_blank",
    text: "Get Started",
  },
];

export const welcomeEmailForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent to welcome new users after they have successfully completed the signup process",
  key: "WelcomeEmail",
  title: "Welcome Email",
};
