import {createEmailTemplate} from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: "font-size:24px font-weight:bold mb:16",
    componentName: "Html",
    text: "Welcome to Our Platform!"
  },
  {
    as: "p",
    class: "mb:16",
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
    class: "mb:24",
    componentName: "Html"
  },
  {
    as: "button",
    class: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
    componentName: "Html",
    text: "Get Started"
  }
];
export const welcomeEmailForm = {attributes: [createEmailTemplate(content)], key: "WelcomeEmail"}