import { describe, expect, test } from "vitest";
import { graph } from "../lib/graph";
import { createUniqueId } from "solid-js";
import { klona } from "klona";
import { addNewVertex, deleteVertex, newVertex, replaceVertexProperties } from "../lib/Vertex";

interface TableDataType {
 leftParens?: string
 filterField: string
 filterFieldId: string
 searchOperator: string
 filterFieldValue: string
 andor?: string
 rightParens?: string
}
describe('addNewVertex', () => {
 test('modifying vertex dont change store', async() => {
  const tableData: TableDataType[] = [
   {
    "leftParens": "(",
    "filterField": "lastname",
    "filterFieldId": "lastname",
    "searchOperator": "is",
    "filterFieldValue": "modi",
    "andor": "AND"
   },
   {
    "leftParens": "(",
    "filterField": "balance",
    "filterFieldId": "balance",
    "searchOperator": "greaterthan",
    "filterFieldValue": "1000",
    "andor": "OR"
   },
   {
    "filterField": "balance",
    "filterFieldId": "balance",
    "searchOperator": "lessthan",
    "filterFieldValue": "5000",
    "rightParens": "))",
    "andor": "OR"
   },
   {
    "filterField": "lastname",
    "filterFieldId": "lastname",
    "searchOperator": "is",
    "filterFieldValue": "shah"
   }
  ]
  const transform = () => {
   const processedFilterExpressions = [];

   const numberArrayRegex = /^\d+(,\d+)+$/;
   let temp1 = [];
   let temp2 = [];
   let temp3 = [];
   let lastLeftParens = 0;
   tableData.forEach(filter => {
    const makeFilter = () => [filter.filterFieldId,filter.searchOperator, filterFieldValue];
    const andOr = () => filter.andor === "OR" ? "OR" : "AND"
    const filterFieldValue = numberArrayRegex.test(filter.filterFieldValue)
     ? filter.filterFieldValue.split(',').map(filterValue => parseInt(filterValue))
     : filter.filterFieldValue;


    if(filter.leftParens === '(((') {
     lastLeftParens = 3;
     // temp3.push(temp2);
     // temp2.push(temp1);
     // temp1.push(makeFilter());
     // temp1.push(andOr());
    }
    if(filter.leftParens === '((') {
     lastLeftParens = 3;
     // temp3.push(temp2);
     // temp2.push(temp1);
     // temp1.push(makeFilter());
     // temp1.push(andOr());
    }
    if(filter.leftParens === '(') {
     if(lastLeftParens === 0) {
      lastLeftParens = 1;
      // temp1.push(makeFilter());
      // temp1.push(andOr());
     } else if (lastLeftParens === 1) {
      lastLeftParens = 2;
      // temp2.push(makeFilter());
      // temp2.push(andOr());
     } else if (lastLeftParens === 2) {
      lastLeftParens = 3;
      // temp3.push(makeFilter());

     }
    }
    if(!filter.leftParens) {
     if(lastLeftParens === 0) {
      processedFilterExpressions.push(makeFilter())

     } else if (lastLeftParens === 1) {
      temp2.push(makeFilter());

     } else if (lastLeftParens === 2) {
      temp3.push(makeFilter());

     }
    }
    //=========================================right
    if(filter.rightParens === '))') {
     if(lastLeftParens === 0) {
      throw "should not happen";
     } else if (lastLeftParens === 1) {
      throw "should not happen";
     } else if (lastLeftParens === 2) {
      lastLeftParens = 0;
      // this may be wrong

      temp2.push(makeFilter()) //? temp2
      processedFilterExpressions.push(temp2);
      processedFilterExpressions.push(andOr())
      temp2 = [];

     }
    }

    if(filter.rightParens === ')') {
     if(lastLeftParens === 0) {
      throw "should not happen";
     } else if (lastLeftParens === 1) {
      lastLeftParens = 0;
      temp1.push(makeFilter())
      processedFilterExpressions.push(temp1);
      processedFilterExpressions.push(andOr())
      temp1 = [];
     } else if (lastLeftParens === 2) {
      lastLeftParens = 1;
      temp2.push(makeFilter())
      processedFilterExpressions.push(temp2);
      processedFilterExpressions.push(andOr())
      temp2 = [];
     }
    }
    if(!filter.rightParens) {
     if(lastLeftParens === 0) {
      processedFilterExpressions.push(makeFilter())
      processedFilterExpressions.push(andOr());
     } else if (lastLeftParens === 1) {

      temp1.push(makeFilter())
      temp1.push(andOr())

     } else if (lastLeftParens === 2) {
      temp2.push(makeFilter())
      temp2.push(andOr())

     }
    }
    // processedFilterExpressions.push(
    //  [filter.filterFieldId,filter.searchOperator.value, filterFieldValue],
    //  `AND`
    // );
   });


   return processedFilterExpressions
  }
  expect(transform()).toEqual([
   [
    ["lastname", "is", "modi"],
    "AND",
    [
     ["balance", "greaterthan", "1000.00"],
     "OR",
     ["balance", "lessthan", "5000.00"]
    ]
   ],
   "OR",
   ["lastname", "is", "shah"]
  ]);
 })
})
