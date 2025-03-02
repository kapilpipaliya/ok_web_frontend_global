import type {
  CSSJSONSchemaSearchType,
  GenericField,
} from "../constants/FieldSchemaType";

import { JSONSchema } from "../constants/CssPropertiesMap";

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

export function filterSections(query: string) {
  return Object.entries(JSONSchema).reduce(
    (acc, [sectionName, propertyFieldMap]) => {
      const filteredProperties = filterPropertyFieldMap(
        propertyFieldMap as { [key: string]: GenericField },
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
function shouldIncludeProperty(field: GenericField, query: string): boolean {
  if (query === "") {
    return true;
  }
  if (
    field.componentName !== "box" &&
    (field.label?.toLowerCase().includes(query.toLowerCase()) ||
      field.key?.toLowerCase().includes(query.toLowerCase()))
  ) {
    return true;
  }
  if (
    field.componentName === "fieldWithCustomProperty" &&
    (field.customProperty.some((prop) => prop.label?.toLowerCase().includes(query.toLowerCase()) ||
      prop.key?.toLowerCase().includes(query.toLowerCase())))
  ) {
    return true;
  }
  if (field.componentName === "box" && field.children?.length > 0) {
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
