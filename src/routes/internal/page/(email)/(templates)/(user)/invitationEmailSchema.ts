import { createEmailTemplate } from "~/pages/BaseEmailTemplate";

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
    text: "You've Been Invited",
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
    text: "You've been invited to join our platform. Please click the button below to complete your registration and set up your account.",
  },
  {
    as: "a",
    class: JSON.stringify({
      "": {
        "background-color": "primary",
        border: "none",
        "border-radius": "4",
        color: "base-5",
        cursor: "pointer",
        display: "inline-block",
        "margin-bottom": "16",
        padding: "8 16",
        "text-decoration": "none",
      },
      ":hover": {
        opacity: "0.9",
      },
    }),
    componentName: "Html",
    pos: 3,
    props: `return {
      href: args.searchParams.url,
    }`,
    target: "_blank",
    text: "Accept Invitation",
  },
  {
    as: "p",
    class: JSON.stringify({
      "": {
        color: "base",
        "margin-bottom": "16",
      },
    }),
    componentName: "Html",
    pos: 4,
    text: "This invitation link will expire in 7 days. If you have any questions, please contact the administrator who invited you.",
  },
];

export const invitationEmailForm = {
  attributes: [createEmailTemplate(content)],
  description: "Sent to invite new users to join the platform, containing a registration link valid for 7 days",
  key: "InvitationEmail",
  title: "User Invitation",

};
