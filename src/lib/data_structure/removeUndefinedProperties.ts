// https://github.com/d4nyll/rundef/blob/master/index.js
export function removeUndefinedProperties(
  obj: { [key: string]: any },
  mutate = false,
  recursive = 0,
) {
  const returnObj = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val === undefined) {
      if (mutate) {
        delete obj[key];
      }
    } else {
      let recursiveVal;
      if (recursive > 0 && val !== null && typeof val === "object") {
        recursiveVal = removeUndefinedProperties(
          val,
          mutate,
          // @ts-ignore
          typeof recursive === "number" ? recursive - 1 : true,
        );
      }
      if (!mutate) {
        // @ts-ignore
        returnObj[key] = recursiveVal || val;
      }
    }
  });
  return mutate ? obj : returnObj;
}
