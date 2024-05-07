import { Session } from "neo4j-driver";

// https://github.com/d4nyll/rundef/blob/master/index.js
export function removeUndefinedProperties(obj, mutate = false, recursive = 0) {
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
          typeof recursive === "number" ? recursive - 1 : true,
        );
      }
      if (!mutate) {
        returnObj[key] = recursiveVal || val;
      }
    }
  });
  return mutate ? obj : returnObj;
}

export function getLastItem<T>(arr: T[], index = 1): T | undefined {
  return arr[arr.length - index];
}

export async function checkPropertyExists(
  nodeLabel: string,
  session: Session,
  property: string,
  value: any,
) {
  const query = `MATCH (u:${nodeLabel}) WHERE u.${property} = $value RETURN u`;
  const result = await session.run(query, { value });
  return result.records.length > 0;
}
