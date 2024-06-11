
export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
export function deNullify<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(obj)) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key as keyof T] = obj[key];
    }
  }

  return result;
}


export function ifNotNull<T>(value: T | null): T | undefined {
  return value !== null ? value : undefined;
}
