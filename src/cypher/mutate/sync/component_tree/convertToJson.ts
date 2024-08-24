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
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const yamlFilePath = path.resolve(__dirname, "componentTree.yaml");

  const yamlContent = fs.readFileSync(yamlFilePath, "utf8");

  const parsedYaml: ParsedYamlNode[] = parse(yamlContent);
  return cleanFormat(convertToRequiredFormat(parsedYaml));
}
