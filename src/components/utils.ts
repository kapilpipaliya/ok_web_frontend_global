// https://github.com/diondree/javascript-from-string/blob/master/index.js
export function convertToJS(jsString) {
 if (jsString === "" || jsString === null) {
  return undefined;
 }
 try {
  return (Function(`"use strict";return (${jsString})`)());
 } catch (e) {
  console.warn(e);
  return undefined;
 }
}