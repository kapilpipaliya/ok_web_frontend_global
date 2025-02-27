import {createEmailTemplate} from "~/routes/internal/page/(email)/BaseEmailTemplate";

const content = [
  {
    as: "h1",
    class: JSON.stringify({
      '': {
        'font-size': '24px',
        'font-weight': 'bold',
        'margin-bottom': '16'
      }
    }),
    componentName: "Html",
    pos: 1,
    text: "Profile Updated Successfully"
  },
  {
    as: "p",
    class: JSON.stringify({
      '': {
        'margin-bottom': '16'
      }
    }),
    componentName: "Html",
    pos: 2,
    text: "Your profile information has been successfully updated."
  },
  {
    as: "button",
    class: JSON.stringify({
      '': {
        'background-color': 'primary',
        'border': 'none',
        'border-radius': '4',
        'color': 'base-5',
        'cursor': 'pointer',
        'padding': '8 16'
      },
      ':hover': {
        'opacity': '0.9'
      }
    }),
    componentName: "Html",
    pos: 3,
    text: "View Profile"
  }
];

export const profileUpdatedForm = {attributes: [createEmailTemplate(content)], key: "ProfileUpdated", title: "Profile Updated Successfully"}