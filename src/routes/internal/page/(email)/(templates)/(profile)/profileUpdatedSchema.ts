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
    text: "Profile Updated Successfully",
  },
  {
    as: "p",
    css: css`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 2,
    text: "Your profile information has been successfully updated.",
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
    pos: 3,
    props: `return {
      // href: window.location.origin + "/admin/UserSettings",
      href: "${typeof window !== "undefined" ? window.location.origin : ""}/"
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
