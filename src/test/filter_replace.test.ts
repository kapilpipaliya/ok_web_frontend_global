import { describe, expect, test } from "vitest";
function getUserDynamicFilters({ filterExpression, userLookupResponse, currentFormValue }) {
  console.log(filterExpression);
  if (typeof filterExpression === "string") {
    try {
      filterExpression = JSON.parse(filterExpression);
    } catch {
      return filterExpression;
    }
  }
  if (!filterExpression || typeof filterExpression[filterExpression.length - 1] !== "string") {
    return filterExpression;
  }

  let sourceField;
  let fieldValue;

  if (filterExpression[filterExpression.length - 1]?.indexOf("$user.") !== -1) {
    sourceField = filterExpression[filterExpression.length - 1]?.replace("$user.", "").trim();

    fieldValue = userLookupResponse[sourceField];
  } else if (filterExpression[filterExpression.length - 1]?.indexOf("$record.") > -1) {
    sourceField = filterExpression[filterExpression.length - 1]?.replace("$record.", "").trim();
  }
  filterExpression[filterExpression.length - 1] = "ABC";
}

const processOneFilter = (filter) => {
  expect(filter.length).toBe(3);
  expect(filter[0]).toBeTypeOf("string");
  expect(filter[1]).toBeTypeOf("string");
  expect(filter[2]).toBeTypeOf("string");
  const newFilter = [...filter];
  newFilter[2] = "ABC";
  return newFilter;
};
const ReplaceDynamicFieldsInFilterExpression = (data: any[]) => {
  if (Array.isArray(data)) {
    if (typeof data[0] === "string") {
      getUserDynamicFilters({ filterExpression: data });
    } else {
      for (let i = 0; i < data.length; i++) {
        ReplaceDynamicFieldsInFilterExpression(data[i]);
      }
    }
  }
  return data;
};

const dependantfields = (data: any[]) => {
  const searchColumnsList = [];
  if (Array.isArray(data)) {
    if (typeof data[0] === "string") {
      let searchColumn = data[data.length - 1];
      if (typeof searchColumn === "string" && searchColumn.indexOf("$record.") > -1) {
        searchColumn = searchColumn.replace("$record.", "");

        searchColumnsList.push(searchColumn);
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        searchColumnsList.push(...dependantfields(data[i]));
      }
    }
  }
  return searchColumnsList;
};

describe("ReplaceDynamicFieldsInFilterExpression", () => {
  test("modifying vertex dont change store", async () => {
    expect(
      ReplaceDynamicFieldsInFilterExpression([
        [
          ["lastname", "is", "modi"],
          "AND",
          [["balance", "greaterthan", "1000.00"], "OR", ["balance", "lessthan", "5000.00"]],
        ],
        "OR",
        ["lastname", "is", "shah"],
      ]),
    ).toEqual([
      [["lastname", "is", "ABC"], "AND", [["balance", "greaterthan", "ABC"], "OR", ["balance", "lessthan", "ABC"]]],
      "OR",
      ["lastname", "is", "ABC"],
    ]);

    expect(
      dependantfields([
        [
          ["lastname", "is", "$record.modi"],
          "AND",
          [["balance", "greaterthan", "1000.00"], "OR", ["balance", "lessthan", "$record.kapil"]],
        ],
        "OR",
        ["lastname", "is", "shah"],
      ]),
    ).toEqual(["modi", "kapil"]);
  });
});
