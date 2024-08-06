export function paginationExpression(params: {
  coll?: string;
  custom?: string;
  filter?: string;
  limit?: number;
  skip?: number;
}): string {
  if (params.custom) {
    return params.custom;
  }

  let dynamicString = "";

  if (params.coll) {
    dynamicString += `g:'${params.coll}`;
    const options = [] as string[];

    if (params.filter) { options.push(params.filter); }
    if (params.skip) { options.push(`skip=${params.skip}`); }
    if (params.limit && params.limit !== 0) {
      options.push(`limit=${params.limit}`);
    }

    if (options.length > 0) {
      dynamicString += `[${options.join(" ")}]`;
    }

    dynamicString += "'";
  } else {
    throw new Error("Either 'coll' or 'custom' must be provided.");
  }

  return dynamicString;
}
