import fs from "node:fs";
import { parse, } from "yaml";

import type { ComponentNode } from "./ComponentTreeType";

type ParsedYamlNode = { [key: string]: ParsedYamlNode[] } | string;

// Load the YAML content from a string or a file
const yamlContent = fs.readFileSync("input.yaml", "utf8");

// Parse the YAML content
const parsedYaml: ParsedYamlNode[] = parse(yamlContent);

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
  return cleanFormat(convertToRequiredFormat(parsedYaml));
}
