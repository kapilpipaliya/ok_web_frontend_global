import { parse } from "yaml";

import type { ComponentNode } from "./type/ComponentTreeType";

type ParsedYamlNode = string | { [key: string]: ParsedYamlNode[] };

export function getComponentTree(): ComponentNode[] {
  const yamlContent = `- Root:
  - Html
  - Icon
  - Portal
  - Data
  - Form
  - Head
  - ComponentChildren
`;
  //   - Link
  //   - Meta
  // - Table
  // - Transition
  // - TransitionGroup
  const parsedYaml: ParsedYamlNode[] = parse(yamlContent);
  return cleanFormat(convertToRequiredFormat(parsedYaml));
}

function cleanFormat(data: ComponentNode[]): ComponentNode[] {
  return data.map((item) => {
    if (item.children && item.children.length > 0) {
      item.children = cleanFormat(item.children);
    } else {
      delete item.children;
    }
    return item;
  });
}

function convertToRequiredFormat(data: ParsedYamlNode[]): ComponentNode[] {
  return data.map((item) => {
    if (typeof item === "string") {
      return { Component: item };
    }
    const key = Object.keys(item)[0];
    return {
      children: item[key] ? convertToRequiredFormat(item[key]) : undefined,
      Component: key,
    };
  });
}

/*
  - FileUploader
  - Popover:
    - Popover.Anchor:
      - Popover.Trigger
    - Popover.Portal:
        - Popover.Overlay
        - Popover.Content:
            - Popover.Arrow
            - Popover.Close
            - Popover.Label
            - Popover.Description
  - Tooltip:
    - Tooltip.Anchor:
      - Tooltip.Trigger
    - Tooltip.Portal:
      - Tooltip.Content:
        - Tooltip.Arrow
      - Tooltip.Overlay
*/
/*
  - Accordion:
    - Accordion.Item:
      - Accordion.Trigger
      - Accordion.Content
  - Dialog:
      - Dialog.Trigger
      - Dialog.Portal:
          - Dialog.Overlay
          - Dialog.Content:
              - Dialog.Close
              - Dialog.Label
              - Dialog.Description
  - Disclosure:
    - Disclosure.Trigger
    - Disclosure.Content
  - Drawer:
    - Drawer.Trigger
    - Drawer.Portal:
        - Drawer.Overlay
        - Drawer.Content:
            - Drawer.Close
            - Drawer.Label
            - Drawer.Description
  - Resizable:
    - Resizable.Handle
    - Resizable.Panel
  - OtpField:
    - OtpField.Input
*/
