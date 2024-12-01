import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

import type { ComponentNode } from "./ComponentTreeType";

type ParsedYamlNode = { [key: string]: ParsedYamlNode[] } | string;

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

export function getComponentTree(): ComponentNode[] {


  const yamlContent = `- Root:
  - Box
  - Button
  - CheckBox
  - DynamicTable
  - FileUploader
  - Form
  - FormError
  - Fragment
  - Icon
  - Image
  - KeyedContext
  - MultiSelect
  - Page
  - Portal
  - PullToRefresh
  - RadioGroup:
    - Radio
  - Repeater
  - Select
  - Steps:
    - Step
    - ActiveStep
  - Text
  - TextArea
  - TextInput
  - Transition
  - TransitionGroup
  - ZIndex
`

  const parsedYaml: ParsedYamlNode[] = parse(yamlContent);
  return cleanFormat(convertToRequiredFormat(parsedYaml));
}
