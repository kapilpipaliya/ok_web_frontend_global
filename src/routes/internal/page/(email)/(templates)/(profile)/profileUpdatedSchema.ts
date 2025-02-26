import {createEmailTemplate} from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: "font-size:24px font-weight:bold mb:16",
    componentName: "Html",
    text: "Profile Updated Successfully"
  },
  {
    as: "p",
    class: "mb:16",
    componentName: "Html",
    text: "Your profile information has been successfully updated."
  },
  {
    as: "button",
    class: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
    componentName: "Html",
    text: "View Profile"
  }
];
export const profileUpdatedForm = {attributes: [createEmailTemplate(content)], key: "ProfileUpdated"}