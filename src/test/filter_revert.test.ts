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

const transform = (filterData: any[]) => {
  // @ts-ignore
  const numberArrayRegex = /^\d+(,\d+)+$/;

  const rows = [] as TableDataType[];

  const addRow = (
    leftParens: string,
    filterField: string,
    filterFieldId: string,
    searchOperator: string,
    filterFieldValue: any,
    andor: string,
  ) => {
    rows.push({
      leftParens,
      filterField,
      filterFieldId,
      searchOperator,
      filterFieldValue,
      andor,
    });
  };

  const isFilter = (arr: any[]) => {
    return Array.isArray(arr) && arr.length === 3 && typeof arr[0] === "string" && typeof arr[1] === "string";
  };
  const isAndOr = (f: string) => f === "AND" || f === "OR";
  const getLeftParens = (num: number) => {
    switch (num) {
      case 1:
        return "(";
      case 2:
        return "((";
      case 3:
        return "(((";
      default:
        return "";
    }
  };
  // @ts-ignore:
  const getRightParens = (num: number) => {
    switch (num) {
      case 1:
        return ")";
      case 2:
        return "))";
      case 3:
        return ")))";
      default:
        return "";
    }
  };
  let openParenThesesCount = 0;
  let closeParenThesesCount = 0;
  let isFirst = true;
  const convert = (data: any) => {
    if (isFilter(data)) {
      addRow(getLeftParens(openParenThesesCount), data[0], data[0], data[1], data[2], "");
      openParenThesesCount = 0;
    } else if (isAndOr(data)) {
      rows[rows.length - 1].andor = data;
    } else if (Array.isArray(data)) {
      if (isFirst) {
        isFirst = false;
      } else {
        openParenThesesCount++;
        closeParenThesesCount++;
      }
      data.forEach((d) => convert(d));
      if (closeParenThesesCount > 0) {
        closeParenThesesCount--;
        const rightParens = rows[rows.length - 1].rightParens;
        switch (rightParens) {
          case undefined:
          case "":
            rows[rows.length - 1].rightParens = ")";
            break;
          case ")":
            rows[rows.length - 1].rightParens = "))";
            break;
          case "))":
            rows[rows.length - 1].rightParens = ")))";
            break;
          default:
            rows[rows.length - 1].rightParens = "";
            break;
        }
      }
    }
  };

  convert(filterData);
  return rows;
};

describe("addNewVertex", () => {
  test("modifying vertex dont change store", async () => {
    const resultData = [
      [
        ["lastname", "is", "modi"],
        "AND",
        [["balance", "greaterthan", "1000.00"], "OR", ["balance", "lessthan", "5000.00"]],
      ],
      "OR",
      ["lastname", "is", "shah"],
    ];

    expect(transform(resultData)).toEqual([
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
        leftParens: "",
        filterField: "balance",
        filterFieldId: "balance",
        searchOperator: "lessthan",
        filterFieldValue: "5000.00",
        rightParens: "))",
        andor: "OR",
      },
      {
        leftParens: "",
        filterField: "lastname",
        filterFieldId: "lastname",
        searchOperator: "is",
        filterFieldValue: "shah",
        andor: "",
      },
    ]);
  });

  test("abc", () => {
    const resultData = [
      [["item", "anyof", "Journal"], "AND", [["account", "anyof", "125"], "OR", ["account", "anyof", "123"]]],
      "AND",
      ["account", "anyof", "117"],
    ];

    expect(transform(resultData)).toEqual([
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
        leftParens: "",
        rightParens: "))",
        andor: "AND",
      },
      {
        andor: "",
        filterField: "account",
        filterFieldId: "account",
        searchOperator: "anyof",
        leftParens: "",
        filterFieldValue: "117",
      },
    ]);
  });

  test("abcd1", () => {
    const tableData = [
      [[[["account", "anyof", "2"], "AND", [[[["account", "anyof", "1"]]]], "OR", ["account", "anyof", "3"]]]],
    ];

    expect(transform(tableData)).toEqual([
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
        leftParens: "",
        rightParens: ")))",
        andor: "",
      },
    ]);
  });

  test("abcd33", () => {
    const tableData = ["account", "anyof", "2"];

    expect(transform(tableData)).toEqual([
      {
        leftParens: "",
        filterField: "account",
        filterFieldId: "account",
        searchOperator: "anyof",
        filterFieldValue: "2",
        andor: "",
      },
    ]);
  });
});
