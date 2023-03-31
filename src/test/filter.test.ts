import { describe, expect, test } from "vitest";

interface TableDataType {
  leftParens?: string;
  filterField: string;
  filterFieldId: string;
  searchOperator: string;
  filterFieldValue: string;
  andor?: string;
  rightParens?: string;
}

const transform = (tableData: TableDataType[]) => {
  const numberArrayRegex = /^\d+(,\d+)+$/;
  let result = [] as any[];

  const openParenIndexes = [] as number[];
  const getNestedItem = (arr: any[], ...inxs: number[]): any => {
    if (inxs && inxs.length) {
      return getNestedItem(arr[inxs[0]], ...inxs.slice(1));
    } else {
      return arr;
    }
  };

  function addNestedArray() {
    if (!openParenIndexes.length) {
      result.push([]);
      openParenIndexes.push(result.length - 1);
    } else {
      const lastItem = getNestedItem(result, ...openParenIndexes);
      lastItem.push([]);
      openParenIndexes.push(lastItem.length - 1);
    }
  }

  tableData.forEach((filter, index) => {
    const makeFilter = () => {
      const filterFieldValue = numberArrayRegex.test(filter.filterFieldValue)
        ? filter.filterFieldValue.split(",").map((filterValue) => parseInt(filterValue))
        : filter.filterFieldValue;
      return [filter.filterFieldId, filter.searchOperator, filterFieldValue];
    };
    const andOr = () => (filter.andor === "OR" ? "OR" : "AND");

    // left parentheses:
    if (filter.leftParens === "(((") {
      addNestedArray();
      addNestedArray();
      addNestedArray();
    }
    if (filter.leftParens === "((") {
      addNestedArray();
      addNestedArray();
    }
    if (filter.leftParens === "(") {
      addNestedArray();
    }
    if (!filter.leftParens) {
      // No need to handle this
    }
    if (filter.rightParens === ")))") {
      getNestedItem(result, ...openParenIndexes).push(makeFilter());
      openParenIndexes.pop();
      openParenIndexes.pop();
      openParenIndexes.pop();
      if (index < tableData.length - 1) getNestedItem(result, ...openParenIndexes).push(andOr());
    }
    if (filter.rightParens === "))") {
      getNestedItem(result, ...openParenIndexes).push(makeFilter());
      openParenIndexes.pop();
      openParenIndexes.pop();
      if (index < tableData.length - 1) getNestedItem(result, ...openParenIndexes).push(andOr());
    }

    if (filter.rightParens === ")") {
      getNestedItem(result, ...openParenIndexes).push(makeFilter());
      openParenIndexes.pop();
      if (index < tableData.length - 1) getNestedItem(result, ...openParenIndexes).push(andOr());
    }
    if (!filter.rightParens) {
      if (!openParenIndexes.length) {
        result.push(makeFilter());
        if (index < tableData.length - 1) result.push(andOr());
      } else {
        getNestedItem(result, ...openParenIndexes).push(makeFilter());
        if (index < tableData.length - 1) getNestedItem(result, ...openParenIndexes).push(andOr());
      }
    }
  });
  return result;
};

describe("addNewVertex", () => {
  test("modifying vertex dont change store", async () => {
    const tableData: TableDataType[] = [
      {
        leftParens: "(",
        filterField: "lastname",
        filterFieldId: "lastname",
        searchOperator: "is",
        filterFieldValue: "modi",
        andor: "AND",
      },
      {
        leftParens: "(",
        filterField: "balance",
        filterFieldId: "balance",
        searchOperator: "greaterthan",
        filterFieldValue: "1000.00",
        andor: "OR",
      },
      {
        filterField: "balance",
        filterFieldId: "balance",
        searchOperator: "lessthan",
        filterFieldValue: "5000.00",
        rightParens: "))",
        andor: "OR",
      },
      {
        filterField: "lastname",
        filterFieldId: "lastname",
        searchOperator: "is",
        filterFieldValue: "shah",
      },
    ];

    expect(transform(tableData)).toEqual([
      [
        ["lastname", "is", "modi"],
        "AND",
        [["balance", "greaterthan", "1000.00"], "OR", ["balance", "lessthan", "5000.00"]],
      ],
      "OR",
      ["lastname", "is", "shah"],
    ]);
  });

  test("abc", () => {
    const tableData: TableDataType[] = [
      {
        leftParens: "(",
        filterField: "item",
        filterFieldId: "item",
        searchOperator: "anyof",
        filterFieldValue: "Journal",
        andor: "AND",
      },
      {
        leftParens: "(",
        filterField: "account",
        filterFieldId: "account",
        searchOperator: "anyof",
        filterFieldValue: "125",
        andor: "OR",
      },
      {
        filterField: "account",
        filterFieldId: "account",
        searchOperator: "anyof",
        filterFieldValue: "123",
        rightParens: "))",
        andor: "AND",
      },
      {
        filterField: "account",
        filterFieldId: "account",
        searchOperator: "anyof",
        filterFieldValue: "117",
      },
    ];

    expect(transform(tableData)).toEqual([
      [["item", "anyof", "Journal"], "AND", [["account", "anyof", "125"], "OR", ["account", "anyof", "123"]]],
      "AND",
      ["account", "anyof", "117"],
    ]);
  });
  test("abcd", () => {
    const tableData: TableDataType[] = [
      {
        leftParens: "(((",
        filterField: "account",
        filterFieldId: "account",
        searchOperator: "anyof",
        filterFieldValue: "2",
        andor: "AND",
      },
      {
        leftParens: "(((",
        filterField: "account",
        filterFieldId: "account",
        searchOperator: "anyof",
        filterFieldValue: "1",
        rightParens: ")))",
        andor: "OR",
      },
      {
        filterField: "account",
        filterFieldId: "account",
        searchOperator: "anyof",
        filterFieldValue: "3",
        rightParens: ")))",
      },
    ];

    expect(transform(tableData)).toEqual([
      [[[["account", "anyof", "2"], "AND", [[[["account", "anyof", "1"]]]], "OR", ["account", "anyof", "3"]]]],
    ]);
  });
});
