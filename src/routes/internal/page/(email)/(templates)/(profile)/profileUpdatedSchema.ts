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
    text: "Profile Updated Successfully",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.text_hex};
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "Your profile information has been successfully updated.",
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
      padding: 8px 16px;
      text-decoration: none;
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
    props: `return {
      // href: window.location.origin + "/admin/UserSettings",
      href: "${typeof window === "undefined" ? "" : window.location.origin}/"
    }`,
    target: "_blank",
    text: "View Profile",
  },
];

export const profileUpdatedForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Confirmation email sent after a user has made changes to their profile information",
  key: "ProfileUpdated",
  title: "Profile Updated Successfully",
};
