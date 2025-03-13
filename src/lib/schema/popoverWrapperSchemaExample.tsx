import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { popoverWrapperSchema } from "./popoverWrapperSchema";

/**
 * Example of how to use the popoverWrapperSchema function
 */
export const popoverWrapperSchemaExample = () => {
  // Create a button that will trigger the popover
  const actionButton = {
    as: "button",
    class:
      "p:8|16 bg:primary color:white r:4 cursor:pointer hover:bg:primary-dark",
    componentName: "Button",
    text: "Hover Me",
  };

  // Create the content that will appear in the popover
  const popoverContent = {
    as: "div",
    attributes: [
      {
        as: "h3",
        class: "font-size:18px color:primary m:0 mb:8",
        as: "span", componentName: "Html",
        text: "Popover Title",
      },
      {
        as: "p",
        class: "font-size:14px color:base-80 m:0",
        as: "span", componentName: "Html",
        text: "This is the popover content. You can hover over the button to see this content.",
      },
    ],
    class: "p:12 bg:white shadow:lg r:4 max-width:300px",
    componentName: "Html",
  };

  // Wrap the button with the popover
  return popoverWrapperSchema(actionButton, popoverContent);
};

/**
 * Example of how to use popoverWrapperSchema with dynamic content
 */
export const dynamicPopoverExample = () => {
  // Create a button that will trigger the popover
  const actionButton = {
    as: "button",
    class:
      "p:8|16 bg:secondary color:white r:4 cursor:pointer hover:bg:secondary-dark",
    componentName: "Button",
    text: "Dynamic Popover",
  };

  // Create dynamic content that will appear in the popover
  const dynamicPopoverContent = {
    as: "div",
    attributes: [
      {
        as: "h3",
        class: "font-size:18px color:secondary m:0 mb:8",
        as: "span", componentName: "Html",
        text: "Dynamic Content",
      },
      {
        as: "p",
        class: "font-size:14px color:base-80 m:0",
        as: "span", componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          text: `This popover uses data from context: ${options.dataContext.popoverState[0]?.isVisible ? "Visible" : "Hidden"}`,
        }),
      },
    ],
    class: "p:12 bg:white shadow:lg r:4 max-width:300px",
    componentName: "Html",
  };

  // Wrap the button with the popover
  return popoverWrapperSchema(actionButton, dynamicPopoverContent);
};
