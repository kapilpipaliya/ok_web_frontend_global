import type {
  CSSJSONSchemaSearchType,
  GenericField,
} from "../constants/FieldType";

import { JSONSchema } from "../constants/CssPropertiesMap";

export function filterSections(query: string) {
  return Object.entries(JSONSchema).reduce(
    (acc, [sectionName, propertyFieldMap]) => {
      const filteredProperties = filterPropertyFieldMap(
        propertyFieldMap,
        query,
      );
      if (Object.keys(filteredProperties).length > 0) {
        acc[sectionName] = {
          isOpen: true, //!!query,
          propertyFieldMap: filteredProperties,
        };
      }
      return acc;
    },
    {} as CSSJSONSchemaSearchType,
  );
}

export function filterPropertyFieldMap(
  propertyFieldMap: { [key: string]: GenericField },
  query: string,
) {
  return Object.fromEntries(
    Object.entries(propertyFieldMap).filter(([, field]) =>
      shouldIncludeProperty(field, query),
    ),
  );
}

function shouldIncludeProperty(field: GenericField, query: string): boolean {
  if (
    field.component !== "grid" &&
    field.label?.toLowerCase().includes(query.toLowerCase())
  ) {
    return true;
  }
  if (field.component === "grid" && field.children?.length > 0) {
    const matchingChildren = field.children.filter((child) =>
      shouldIncludeProperty(child, query),
    );
    if (matchingChildren.length > 0) {
      field.children = matchingChildren;
      return true;
    }
  }
  return false;
}
