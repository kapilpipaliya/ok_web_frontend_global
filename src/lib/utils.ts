import type { Vertex } from "~/lib/graph/graph";


export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getValueFromVertexOrKey(
  obj: { [key: string]: Vertex } | any,
  key: string,
) {
  return obj?.[key];
  // return obj[key]?.id ? obj[key].P.value : obj[key];
}
export const isPageDesignerPath = (path: string) => {
  const lowerPath = path.toLowerCase();
  const pageDesignerPath = [
    "/admin/page/",
    "/admin/form/",
    "/admin/template/",
    "/admin/thankyou/"
  ];

  return pageDesignerPath.some(Path => lowerPath.includes(Path));
};
export function isObject(i: any) {
  if (i && !Array.isArray(i)) {
    return "object" === typeof i;
  }
  return !1;
}

export function groupBy(
  xs: { [key: string]: any }[],
  groupFn: (record: { [key: string]: any }) => string,
) {
  return xs.reduce((acc, element) => {
    const key = groupFn(element);
    const value = acc[key];
    if (value !== void 0) {
      value.push(element);
    } else {
      acc[key] = [element];
    }
    return acc;
  }, {});
}

//'setValue(component,null)'

export function getLabel(input: string) {
  input = input.replaceAll(" ", "");
  input = capitalizeFirstLetter(input);
  // TODO: letter make pascalCase letter
  return input;
}

export function getId(input: string) {
  input = input.replaceAll(" ", "");
  input = input.toLowerCase();
  // TODO: letter make pascalCase letter
  return input;
} // ts-belt
export function isNumber(i: any) {
  if ("number" === typeof i) {
    return !Number.isNaN(i);
  }
  return !1;
}
