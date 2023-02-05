// https://github.com/diondree/javascript-from-string/blob/master/index.js
import {
 commitTransaction,
 getExistingOrDefaultTxnValue,
 getNewGraphId,
 getTransactionData,
 graph,
 isValidId,
 revertTransaction,
 transactionDetailAdd
} from "../lib/graph";
import {
 addNewVertex,
 deleteVertex,
 findVertexIdsByLabel,
 newVertex,
 replaceVertexProperties,
 updateVertexId
} from "../lib/Vertex";
import {
 addNewEdge,
 deleteEdge,
 getOutEdgeIdsOfType,
 newEdge,
 replaceEdgeEnd,
 replaceEdgeProperties,
 replaceEdgeStart,
 updateEdgeId
} from "../lib/Edge";
import { saveTableDataToEdge } from "./api";

export function convertToJS(jsString: string) {
 if (jsString === "" || jsString === null) {
  return undefined;
 }
 try {
  return (Function(`"use strict";return (${jsString})`)());
 } catch (e) {
  console.warn(e, jsString);
  return undefined;
 }
}


/**
 * We cache the evaled code snipped, so we do NOT need to re-compile them over and over again.
 *
 * @type {{}}
 * @private
 */
const evalCache = {};

/**
 * Sets up helper functions and evals the given code
 *
 * The helper functions are defined in the same scope as the final eval() call.
 * So all the helpers are available in evaled code.
 *
 * @param {string} code
 *
 * @return {any}
 */
const doEval = (code: string) => {
 /**
  * @type {Store}
  */
 graph;
 transactionDetailAdd
 getExistingOrDefaultTxnValue
 revertTransaction
 getTransactionData
 commitTransaction
 getNewGraphId
 isValidId


 newVertex
 addNewVertex
 replaceVertexProperties
 deleteVertex
 updateVertexId
 findVertexIdsByLabel

 newEdge
 addNewEdge
 replaceEdgeProperties
 replaceEdgeStart
 replaceEdgeEnd
 deleteEdge
 updateEdgeId
 getOutEdgeIdsOfType

 saveTableDataToEdge

 // ----------------------------------------------------------------------------------------------------------------------

 const raise = (error: any) => {
  throw new Error(error ? error.toString() : "unknown error");
 };

 raise.help = `
raise (error)
-------------
  Raises an "error"

Example:
  raise("Something went wrong")
`;

 return eval(code);

};

/**
 * @param {string} code
 * @return {any}
 */
export const evalImpl = (code: string) => {

 const codeStr = "" + code;

 if (evalCache.hasOwnProperty(codeStr)) {
  // @ts-ignore
  return evalCache[codeStr];
 }

 /** @type {undefined | any} */
 let evaled = undefined;

 try {
  evaled = doEval(codeStr);
 } catch (err) {
  console.error("[Evaljs] Error compiling code", err, codeStr);
 }

 // @ts-ignore
 evalCache[codeStr] = evaled;

 return evaled;
};

/**
 * @param {string}          code     JS code as string that returns a javascript object
 * @param {function(*) : *} callback The callback to call with the evaled object as the first parameter
 * @param {*?}              fallback The fallback will be returned, when the code is empty or cannot be compiled
 *
 * @return {{}}
 */
// @ts-ignore
const run = (code: string, callback: (result: any) => void, fallback: any) => {

 let evaled = evalImpl(code);

 try {
  if (evaled === undefined) {
   return fallback;
  } else {
   const result = callback(evaled);
   if (result === undefined) {
    return fallback;
   } else {
    return result;
   }
  }
 } catch (err) {
  console.error("[Evaljs] Error running callback", err);
  return fallback;
 }
};

export function capitalizeFirstLetter(string: string) {
 return string.charAt(0).toUpperCase() + string.slice(1);
}