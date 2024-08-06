/**
 * © Copyright IBM Corp. 2016, 2018 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */
// @ts-nocheck
import {
  createSequence,
  isDeepEqual as deepEquals,
  getFunctionArity,
  isArrayOfNumbers,
  isArrayOfStrings,
  isFunction,
  isLambda,
  isNumeric,
  isSequence,
  stringToArray,
} from "./utils";

/**
 * Sum function
 * @param {Object} args - Arguments
 * @returns {number} Total value of arguments
 */
export function sum(args) {
  // undefined inputs always return undefined
  if (typeof args === "undefined") {
    return undefined;
  }

  let total = 0;
  args.forEach((num) => {
    total += num;
  });
  return total;
}

/**
 * Count function
 * @param {Object} args - Arguments
 * @returns {number} Number of elements in the array
 */
export function count(args) {
  // undefined inputs always return undefined
  if (typeof args === "undefined") {
    return 0;
  }

  return args.length;
}

/**
 * Max function
 * @param {Object} args - Arguments
 * @returns {number} Max element in the array
 */
export function max(args) {
  // undefined inputs always return undefined
  if (typeof args === "undefined" || args.length === 0) {
    return undefined;
  }

  return Math.max.apply(Math, args);
}

/**
 * Min function
 * @param {Object} args - Arguments
 * @returns {number} Min element in the array
 */
export function min(args) {
  // undefined inputs always return undefined
  if (typeof args === "undefined" || args.length === 0) {
    return undefined;
  }

  return Math.min.apply(Math, args);
}

/**
 * Average function
 * @param {Object} args - Arguments
 * @returns {number} Average element in the array
 */
export function average(args) {
  // undefined inputs always return undefined
  if (typeof args === "undefined" || args.length === 0) {
    return undefined;
  }

  let total = 0;
  args.forEach((num) => {
    total += num;
  });
  return total / args.length;
}

/**
 * Stringify arguments
 * @param {Object} arg - Arguments
 * @param {boolean} [prettify] - Pretty print the result
 * @returns {String} String from arguments
 */
export function string(arg, prettify = false) {
  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  let str;

  if (typeof arg === "string") {
    // already a string
    str = arg;
  } else if (isFunction(arg)) {
    // functions (built-in and lambda convert to empty string
    str = "";
  } else if (typeof arg === "number" && !Number.isFinite(arg)) {
    throw {
      code: "D3001",
      stack: new Error().stack,
      value: arg,
    };
  } else {
    const space = prettify ? 2 : 0;
    if (Array.isArray(arg) && arg.outerWrapper) {
      arg = arg[0];
    }
    str = JSON.stringify(
      arg,
      (_key, val) =>
        typeof val !== "undefined" &&
        val !== null &&
        val.toPrecision &&
        isNumeric(val)
          ? Number(val.toPrecision(15))
          : val && isFunction(val)
            ? ""
            : val,
      space,
    );
  }
  return str;
}

/**
 * Create substring based on character number and length
 * @param {String} str - String to evaluate
 * @param {Integer} start - Character number to start substring
 * @param {Integer} [length] - Number of characters in substring
 * @returns {string|*} Substring
 */
export function substring(str, start, length) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  const strArray = stringToArray(str);
  const strLength = strArray.length;

  if (strLength + start < 0) {
    start = 0;
  }

  if (typeof length !== "undefined") {
    if (length <= 0) {
      return "";
    }
    const end = start >= 0 ? start + length : strLength + start + length;
    return strArray.slice(start, end).join("");
  }

  return strArray.slice(start).join("");
}

/**
 * Create substring up until a character
 * @param {String} str - String to evaluate
 * @param {String} chars - Character to define substring boundary
 * @returns {*} Substring
 */
export function substringBefore(str, chars) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  const pos = str.indexOf(chars);
  if (pos > -1) {
    return str.substr(0, pos);
  }
    return str;
}

/**
 * Create substring after a character
 * @param {String} str - String to evaluate
 * @param {String} chars - Character to define substring boundary
 * @returns {*} Substring
 */
export function substringAfter(str, chars) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  const pos = str.indexOf(chars);
  if (pos > -1) {
    return str.substr(pos + chars.length);
  }
    return str;
}

/**
 * Lowercase a string
 * @param {String} str - String to evaluate
 * @returns {string} Lowercase string
 */
export function lowercase(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  return str.toLowerCase();
}

/**
 * Uppercase a string
 * @param {String} str - String to evaluate
 * @returns {string} Uppercase string
 */
export function uppercase(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  return str.toUpperCase();
}

/**
 * length of a string
 * @param {String} str - string
 * @returns {Number} The number of characters in the string
 */
export function length(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  return stringToArray(str).length;
}

/**
 * Normalize and trim whitespace within a string
 * @param {string} str - string to be trimmed
 * @returns {string} - trimmed string
 */
export function trim(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  // normalize whitespace
  let result = str.replace(/[ \t\n\r]+/gm, " ");
  if (result.charAt(0) === " ") {
    // strip leading space
    result = result.substring(1);
  }
  if (result.charAt(result.length - 1) === " ") {
    // strip trailing space
    result = result.substring(0, result.length - 1);
  }
  return result;
}

/**
 * Pad a string to a minimum width by adding characters to the start or end
 * @param {string} str - string to be padded
 * @param {number} width - the minimum width; +ve pads to the right, -ve pads to the left
 * @param {string} [char] - the pad character(s); defaults to ' '
 * @returns {string} - padded string
 */
export function pad(str, width, char) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  if (typeof char === "undefined" || char.length === 0) {
    char = " ";
  }

  let result;
  const padLength = Math.abs(width) - length(str);
  if (padLength > 0) {
    let padding = new Array(padLength + 1).join(char);
    if (char.length > 1) {
      padding = substring(padding, 0, padLength);
    }
    if (width > 0) {
      result = str + padding;
    } else {
      result = padding + str;
    }
  } else {
    result = str;
  }
  return result;
}

/**
 * Evaluate the matcher function against the str arg
 *
 * @param {*} matcher - matching function (native or lambda)
 * @param {string} str - the string to match against
 * @returns {object} - structure that represents the match(es)
 */
export function evaluateMatcher(matcher, str) {
  const result = matcher.apply(this, [str]);
  // if(isPromise(result)) {
  //     result = await result;
  // }
  if (
    result &&
    !(
      typeof result.start === "number" ||
      result.end === "number" ||
      Array.isArray(result.groups) ||
      isFunction(result.next)
    )
  ) {
    // the matcher function didn't return the correct structure
    throw {
      code: "T1010",
      stack: new Error().stack,
    };
  }
  return result;
}

/**
 * Tests if the str contains the token
 * @param {String} str - string to test
 * @param {String} token - substring or regex to find
 * @returns {Boolean} - true if str contains token
 */
export function contains(str, token) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  let result;

  if (typeof token === "string") {
    result = str.indexOf(token) !== -1;
  } else {
    const matches = evaluateMatcher(token, str);
    result = typeof matches !== "undefined";
  }

  return result;
}

/**
 * Match a string with a regex returning an array of object containing details of each match
 * @param {String} str - string
 * @param {String} regex - the regex applied to the string
 * @param {Integer} [limit] - max number of matches to return
 * @returns {Array} The array of match objects
 */
export function match(str, regex, limit) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  // limit, if specified, must be a non-negative number
  if (limit < 0) {
    throw {
      code: "D3040",
      index: 3,
      stack: new Error().stack,
      value: limit,
    };
  }

  const result = createSequence();

  if (typeof limit === "undefined" || limit > 0) {
    let count = 0;
    let matches = evaluateMatcher(regex, str);
    if (typeof matches !== "undefined") {
      while (
        typeof matches !== "undefined" &&
        (typeof limit === "undefined" || count < limit)
      ) {
        result.push({
          groups: matches.groups,
          index: matches.start,
          match: matches.match,
        });
        matches = evaluateMatcher(matches.next);
        count++;
      }
    }
  }

  return result;
}

/**
 * Match a string with a regex returning an array of object containing details of each match
 * @param {String} str - string
 * @param {String} pattern - the substring/regex applied to the string
 * @param {String} replacement - text to replace the matched substrings
 * @param {Integer} [limit] - max number of matches to return
 * @returns {Array} The array of match objects
 */
export function replace(str, pattern, replacement, limit) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  // pattern cannot be an empty string
  if (pattern === "") {
    throw {
      code: "D3010",
      index: 2,
      stack: new Error().stack,
      value: pattern,
    };
  }

  // limit, if specified, must be a non-negative number
  if (limit < 0) {
    throw {
      code: "D3011",
      index: 4,
      stack: new Error().stack,
      value: limit,
    };
  }

  let replacer;
  if (typeof replacement === "string") {
    replacer = (regexMatch) => {
      let substitute = "";
      // scan forward, copying the replacement text into the substitute string
      // and replace any occurrence of $n with the values matched by the regex
      let position = 0;
      let index = replacement.indexOf("$", position);
      while (index !== -1 && position < replacement.length) {
        substitute += replacement.substring(position, index);
        position = index + 1;
        const dollarVal = replacement.charAt(position);
        if (dollarVal === "$") {
          // literal $
          substitute += "$";
          position++;
        } else if (dollarVal === "0") {
          substitute += regexMatch.match;
          position++;
        } else {
          let maxDigits;
          if (regexMatch.groups.length === 0) {
            // no sub-matches; any $ followed by a digit will be replaced by an empty string
            maxDigits = 1;
          } else {
            // max number of digits to parse following the $
            maxDigits =
              Math.floor(Math.log(regexMatch.groups.length) * Math.LOG10E) + 1;
          }
          index = Number.parseInt(
            replacement.substring(position, position + maxDigits),
            10,
          );
          if (maxDigits > 1 && index > regexMatch.groups.length) {
            index = Number.parseInt(
              replacement.substring(position, position + maxDigits - 1),
              10,
            );
          }
          if (Number.isNaN(index)) {
            // not a capture group, treat the $ as literal
            substitute += "$";
          } else {
            if (regexMatch.groups.length > 0) {
              const submatch = regexMatch.groups[index - 1];
              if (typeof submatch !== "undefined") {
                substitute += submatch;
              }
            }
            position += index.toString().length;
          }
        }
        index = replacement.indexOf("$", position);
      }
      substitute += replacement.substring(position);
      return substitute;
    };
  } else {
    replacer = replacement;
  }

  let result = "";
  let position = 0;

  if (typeof limit === "undefined" || limit > 0) {
    let count = 0;
    if (typeof pattern === "string") {
      let index = str.indexOf(pattern, position);
      while (index !== -1 && (typeof limit === "undefined" || count < limit)) {
        result += str.substring(position, index);
        result += replacement;
        position = index + pattern.length;
        count++;
        index = str.indexOf(pattern, position);
      }
      result += str.substring(position);
    } else {
      let matches = evaluateMatcher(pattern, str);
      if (typeof matches !== "undefined") {
        while (
          typeof matches !== "undefined" &&
          (typeof limit === "undefined" || count < limit)
        ) {
          result += str.substring(position, matches.start);
          const replacedWith = replacer.apply(this, [matches]);
          // if (isPromise(replacedWith)) {
          //     replacedWith = await replacedWith;
          // }
          // check replacedWith is a string
          if (typeof replacedWith === "string") {
            result += replacedWith;
          } else {
            // not a string - throw error
            throw {
              code: "D3012",
              stack: new Error().stack,
              value: replacedWith,
            };
          }
          position = matches.start + matches.match.length;
          count++;
          matches = evaluateMatcher(matches.next);
        }
        result += str.substring(position);
      } else {
        result = str;
      }
    }
  } else {
    result = str;
  }

  return result;
}

/**
 * Base64 encode a string
 * @param {String} str - string
 * @returns {String} Base 64 encoding of the binary data
 */
export function base64encode(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }
  // Use btoa in a browser, or Buffer in Node.js

  const btoa =
    typeof window !== "undefined"
      ? /* istanbul ignore next */ window.btoa
      : (str) => {
          // Simply doing `new Buffer` at this point causes Browserify to pull
          // in the entire Buffer browser library, which is large and unnecessary.
          // Using `global.Buffer` defeats this.
          return new global.Buffer.from(str, "binary").toString("base64");
        };
  return btoa(str);
}

/**
 * Base64 decode a string
 * @param {String} str - string
 * @returns {String} Base 64 encoding of the binary data
 */
export function base64decode(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }
  // Use btoa in a browser, or Buffer in Node.js
  const atob =
    typeof window !== "undefined"
      ? /* istanbul ignore next */ window.atob
      : (str) => {
          // Simply doing `new Buffer` at this point causes Browserify to pull
          // in the entire Buffer browser library, which is large and unnecessary.
          // Using `global.Buffer` defeats this.
          return new global.Buffer.from(str, "base64").toString("binary");
        };
  return atob(str);
}

/**
 * Encode a string into a component for a url
 * @param {String} str - String to encode
 * @returns {string} Encoded string
 */
export function encodeUrlComponent(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  // Catch URIErrors when URI sequence is malformed
  let returnVal;
  try {
    returnVal = encodeURIComponent(str);
  } catch (_e) {
    throw {
      code: "D3140",
      functionName: "encodeUrlComponent",
      stack: new Error().stack,
      value: str,
    };
  }
  return returnVal;
}

/**
 * Encode a string into a url
 * @param {String} str - String to encode
 * @returns {string} Encoded string
 */
export function encodeUrl(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  // Catch URIErrors when URI sequence is malformed
  let returnVal;
  try {
    returnVal = encodeURI(str);
  } catch (_e) {
    throw {
      code: "D3140",
      functionName: "encodeUrl",
      stack: new Error().stack,
      value: str,
    };
  }
  return returnVal;
}

/**
 * Decode a string from a component for a url
 * @param {String} str - String to decode
 * @returns {string} Decoded string
 */
export function decodeUrlComponent(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  // Catch URIErrors when URI sequence is malformed
  let returnVal;
  try {
    returnVal = decodeURIComponent(str);
  } catch (_e) {
    throw {
      code: "D3140",
      functionName: "decodeUrlComponent",
      stack: new Error().stack,
      value: str,
    };
  }
  return returnVal;
}

/**
 * Decode a string from a url
 * @param {String} str - String to decode
 * @returns {string} Decoded string
 */
export function decodeUrl(str) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  // Catch URIErrors when URI sequence is malformed
  let returnVal;
  try {
    returnVal = decodeURI(str);
  } catch (_e) {
    throw {
      code: "D3140",
      functionName: "decodeUrl",
      stack: new Error().stack,
      value: str,
    };
  }
  return returnVal;
}

/**
 * Split a string into an array of substrings
 * @param {String} str - string
 * @param {String} separator - the token or regex that splits the string
 * @param {Integer} [limit] - max number of substrings
 * @returns {Array} The array of string
 */
export function split(str, separator, limit) {
  // undefined inputs always return undefined
  if (typeof str === "undefined") {
    return undefined;
  }

  // limit, if specified, must be a non-negative number
  if (limit < 0) {
    throw {
      code: "D3020",
      index: 3,
      stack: new Error().stack,
      value: limit,
    };
  }

  let result = [];

  if (typeof limit === "undefined" || limit > 0) {
    if (typeof separator === "string") {
      result = str.split(separator, limit);
    } else {
      let count = 0;
      let matches = evaluateMatcher(separator, str);
      if (typeof matches !== "undefined") {
        let start = 0;
        while (
          typeof matches !== "undefined" &&
          (typeof limit === "undefined" || count < limit)
        ) {
          result.push(str.substring(start, matches.start));
          start = matches.end;
          matches = evaluateMatcher(matches.next);
          count++;
        }
        if (typeof limit === "undefined" || count < limit) {
          result.push(str.substring(start));
        }
      } else {
        result.push(str);
      }
    }
  }

  return result;
}

/**
 * Join an array of strings
 * @param {Array} strs - array of string
 * @param {String} [separator] - the token that splits the string
 * @returns {String} The concatenated string
 */
export function join(strs, separator) {
  // undefined inputs always return undefined
  if (typeof strs === "undefined") {
    return undefined;
  }

  // if separator is not specified, default to empty string
  if (typeof separator === "undefined") {
    separator = "";
  }

  return strs.join(separator);
}

/**
 * Formats a number into a decimal string representation using XPath 3.1 F&O fn:format-number spec
 * @param {number} value - number to format
 * @param {String} picture - picture string definition
 * @param {Object} [options] - override locale defaults
 * @returns {String} The formatted string
 */
export function formatNumber(value, picture, options) {
  // undefined inputs always return undefined
  if (typeof value === "undefined") {
    return undefined;
  }

  const defaults = {
    "decimal-separator": ".",
    digit: "#",
    "exponent-separator": "e",
    "grouping-separator": ",",
    infinity: "Infinity",
    "minus-sign": "-",
    NaN: "NaN",
    "pattern-separator": ";",
    "per-mille": "\u2030",
    percent: "%",
    "zero-digit": "0",
  };

  // if `options` is specified, then its entries override defaults
  const properties = defaults;
  if (typeof options !== "undefined") {
    Object.keys(options).forEach((key) => {
      properties[key] = options[key];
    });
  }

  const decimalDigitFamily = [];
  const zeroCharCode = properties["zero-digit"].charCodeAt(0);
  for (let ii = zeroCharCode; ii < zeroCharCode + 10; ii++) {
    decimalDigitFamily.push(String.fromCharCode(ii));
  }

  const activeChars = decimalDigitFamily.concat([
    properties["decimal-separator"],
    properties["exponent-separator"],
    properties["grouping-separator"],
    properties.digit,
    properties["pattern-separator"],
  ]);

  const subPictures = picture.split(properties["pattern-separator"]);

  if (subPictures.length > 2) {
    throw {
      code: "D3080",
      stack: new Error().stack,
    };
  }

  const splitParts = (subpicture) => {
    const prefix = (() => {
      let ch;
      for (let ii = 0; ii < subpicture.length; ii++) {
        ch = subpicture.charAt(ii);
        if (
          activeChars.indexOf(ch) !== -1 &&
          ch !== properties["exponent-separator"]
        ) {
          return subpicture.substring(0, ii);
        }
      }
    })();
    const suffix = (() => {
      let ch;
      for (let ii = subpicture.length - 1; ii >= 0; ii--) {
        ch = subpicture.charAt(ii);
        if (
          activeChars.indexOf(ch) !== -1 &&
          ch !== properties["exponent-separator"]
        ) {
          return subpicture.substring(ii + 1);
        }
      }
    })();
    const activePart = subpicture.substring(
      prefix.length,
      subpicture.length - suffix.length,
    );
    let mantissaPart;
    let exponentPart;
    let integerPart;
    let fractionalPart;
    const exponentPosition = subpicture.indexOf(
      properties["exponent-separator"],
      prefix.length,
    );
    if (
      exponentPosition === -1 ||
      exponentPosition > subpicture.length - suffix.length
    ) {
      mantissaPart = activePart;
      exponentPart = undefined;
    } else {
      mantissaPart = activePart.substring(0, exponentPosition);
      exponentPart = activePart.substring(exponentPosition + 1);
    }
    const decimalPosition = mantissaPart.indexOf(
      properties["decimal-separator"],
    );
    if (decimalPosition === -1) {
      integerPart = mantissaPart;
      fractionalPart = suffix;
    } else {
      integerPart = mantissaPart.substring(0, decimalPosition);
      fractionalPart = mantissaPart.substring(decimalPosition + 1);
    }
    return {
      activePart: activePart,
      exponentPart: exponentPart,
      fractionalPart: fractionalPart,
      integerPart: integerPart,
      mantissaPart: mantissaPart,
      prefix: prefix,
      subpicture: subpicture,
      suffix: suffix,
    };
  };

  // validate the picture string, F&O 4.7.3
  const validate = (parts) => {
    let error;
    let ii;
    const subpicture = parts.subpicture;
    const decimalPos = subpicture.indexOf(properties["decimal-separator"]);
    if (
      decimalPos !== subpicture.lastIndexOf(properties["decimal-separator"])
    ) {
      error = "D3081";
    }
    if (
      subpicture.indexOf(properties.percent) !==
      subpicture.lastIndexOf(properties.percent)
    ) {
      error = "D3082";
    }
    if (
      subpicture.indexOf(properties["per-mille"]) !==
      subpicture.lastIndexOf(properties["per-mille"])
    ) {
      error = "D3083";
    }
    if (
      subpicture.indexOf(properties.percent) !== -1 &&
      subpicture.indexOf(properties["per-mille"]) !== -1
    ) {
      error = "D3084";
    }
    let valid = false;
    for (ii = 0; ii < parts.mantissaPart.length; ii++) {
      const ch = parts.mantissaPart.charAt(ii);
      if (decimalDigitFamily.indexOf(ch) !== -1 || ch === properties.digit) {
        valid = true;
        break;
      }
    }
    if (!valid) {
      error = "D3085";
    }
    const charTypes = parts.activePart
      .split("")
      .map((char) => (activeChars.indexOf(char) === -1 ? "p" : "a"))
      .join("");
    if (charTypes.indexOf("p") !== -1) {
      error = "D3086";
    }
    if (decimalPos !== -1) {
      if (
        subpicture.charAt(decimalPos - 1) ===
          properties["grouping-separator"] ||
        subpicture.charAt(decimalPos + 1) === properties["grouping-separator"]
      ) {
        error = "D3087";
      }
    } else if (
      parts.integerPart.charAt(parts.integerPart.length - 1) ===
      properties["grouping-separator"]
    ) {
      error = "D3088";
    }
    if (
      subpicture.indexOf(
        properties["grouping-separator"] + properties["grouping-separator"],
      ) !== -1
    ) {
      error = "D3089";
    }
    let optionalDigitPos = parts.integerPart.indexOf(properties.digit);
    if (
      optionalDigitPos !== -1 &&
      parts.integerPart
        .substring(0, optionalDigitPos)
        .split("")
        .filter((char) => decimalDigitFamily.indexOf(char) > -1).length > 0
    ) {
      error = "D3090";
    }
    optionalDigitPos = parts.fractionalPart.lastIndexOf(properties.digit);
    if (
      optionalDigitPos !== -1 &&
      parts.fractionalPart
        .substring(optionalDigitPos)
        .split("")
        .filter((char) => decimalDigitFamily.indexOf(char) > -1).length > 0
    ) {
      error = "D3091";
    }
    const exponentExists = typeof parts.exponentPart === "string";
    if (
      exponentExists &&
      parts.exponentPart.length > 0 &&
      (subpicture.indexOf(properties.percent) !== -1 ||
        subpicture.indexOf(properties["per-mille"]) !== -1)
    ) {
      error = "D3092";
    }
    if (
      exponentExists &&
      (parts.exponentPart.length === 0 ||
        parts.exponentPart
          .split("")
          .filter((char) => decimalDigitFamily.indexOf(char) === -1).length > 0)
    ) {
      error = "D3093";
    }
    if (error) {
      throw {
        code: error,
        stack: new Error().stack,
      };
    }
  };

  // analyse the picture string, F&O 4.7.4
  const analyse = (parts) => {
    const getGroupingPositions = (part, toLeft) => {
      const positions = [];
      let groupingPosition = part.indexOf(properties["grouping-separator"]);
      while (groupingPosition !== -1) {
        const charsToTheRight = (
          toLeft
            ? part.substring(0, groupingPosition)
            : part.substring(groupingPosition)
        )
          .split("")
          .filter(
            (char) =>
              decimalDigitFamily.indexOf(char) !== -1 ||
              char === properties.digit,
          ).length;
        positions.push(charsToTheRight);
        groupingPosition = parts.integerPart.indexOf(
          properties["grouping-separator"],
          groupingPosition + 1,
        );
      }
      return positions;
    };
    const integerPartGroupingPositions = getGroupingPositions(
      parts.integerPart,
    );
    const regular = (indexes) => {
      // are the grouping positions regular? i.e. same interval between each of them
      if (indexes.length === 0) {
        return 0;
      }
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      // find the greatest common divisor of all the positions
      const factor = indexes.reduce(gcd);
      // is every position separated by this divisor? If so, it's regular
      for (let index = 1; index <= indexes.length; index++) {
        if (indexes.indexOf(index * factor) === -1) {
          return 0;
        }
      }
      return factor;
    };

    const regularGrouping = regular(integerPartGroupingPositions);
    const fractionalPartGroupingPositions = getGroupingPositions(
      parts.fractionalPart,
      true,
    );

    let minimumIntegerPartSize = parts.integerPart
      .split("")
      .filter((char) => decimalDigitFamily.indexOf(char) !== -1).length;
    const scalingFactor = minimumIntegerPartSize;

    const fractionalPartArray = parts.fractionalPart.split("");
    let minimumFactionalPartSize = fractionalPartArray.filter(
      (char) => decimalDigitFamily.indexOf(char) !== -1,
    ).length;
    let maximumFactionalPartSize = fractionalPartArray.filter(
      (char) =>
        decimalDigitFamily.indexOf(char) !== -1 || char === properties.digit,
    ).length;
    const exponentPresent = typeof parts.exponentPart === "string";
    if (minimumIntegerPartSize === 0 && maximumFactionalPartSize === 0) {
      if (exponentPresent) {
        minimumFactionalPartSize = 1;
        maximumFactionalPartSize = 1;
      } else {
        minimumIntegerPartSize = 1;
      }
    }
    if (
      exponentPresent &&
      minimumIntegerPartSize === 0 &&
      parts.integerPart.indexOf(properties.digit) !== -1
    ) {
      minimumIntegerPartSize = 1;
    }
    if (minimumIntegerPartSize === 0 && minimumFactionalPartSize === 0) {
      minimumFactionalPartSize = 1;
    }
    let minimumExponentSize = 0;
    if (exponentPresent) {
      minimumExponentSize = parts.exponentPart
        .split("")
        .filter((char) => decimalDigitFamily.indexOf(char) !== -1).length;
    }

    return {
      fractionalPartGroupingPositions: fractionalPartGroupingPositions,
      integerPartGroupingPositions: integerPartGroupingPositions,
      maximumFactionalPartSize: maximumFactionalPartSize,
      minimumExponentSize: minimumExponentSize,
      minimumFactionalPartSize: minimumFactionalPartSize,
      minimumIntegerPartSize: minimumIntegerPartSize,
      picture: parts.subpicture,
      prefix: parts.prefix,
      regularGrouping: regularGrouping,
      scalingFactor: scalingFactor,
      suffix: parts.suffix,
    };
  };

  const parts = subPictures.map(splitParts);
  parts.forEach(validate);

  const variables = parts.map(analyse);

  const minus_sign = properties["minus-sign"];
  const zero_digit = properties["zero-digit"];
  const decimal_separator = properties["decimal-separator"];
  const grouping_separator = properties["grouping-separator"];

  if (variables.length === 1) {
    variables.push(JSON.parse(JSON.stringify(variables[0])));
    variables[1].prefix = minus_sign + variables[1].prefix;
  }

  // TODO cache the result of the analysis

  // format the number
  // bullet 1: TODO: NaN - not sure we'd ever get this in JSON
  let pic;
  // bullet 2:
  if (value >= 0) {
    pic = variables[0];
  } else {
    pic = variables[1];
  }
  let adjustedNumber;
  // bullet 3:
  if (pic.picture.indexOf(properties.percent) !== -1) {
    adjustedNumber = value * 100;
  } else if (pic.picture.indexOf(properties["per-mille"]) !== -1) {
    adjustedNumber = value * 1000;
  } else {
    adjustedNumber = value;
  }
  // bullet 4:
  // TODO: infinity - not sure we'd ever get this in JSON
  // bullet 5:
  let mantissa;
  let exponent;
  if (pic.minimumExponentSize === 0) {
    mantissa = adjustedNumber;
  } else {
    // mantissa * 10^exponent = adjustedNumber
    const maxMantissa = 10 ** pic.scalingFactor;
    const minMantissa = 10 ** (pic.scalingFactor - 1);
    mantissa = adjustedNumber;
    exponent = 0;
    while (mantissa < minMantissa) {
      mantissa *= 10;
      exponent -= 1;
    }
    while (mantissa > maxMantissa) {
      mantissa /= 10;
      exponent += 1;
    }
  }
  // bullet 6:
  const roundedNumber = round(mantissa, pic.maximumFactionalPartSize);
  // bullet 7:
  const makeString = (value, dp) => {
    let str = Math.abs(value).toFixed(dp);
    if (zero_digit !== "0") {
      str = str
        .split("")
        .map((digit) => {
          if (digit >= "0" && digit <= "9") {
            return decimalDigitFamily[digit.charCodeAt(0) - 48];
          }
            return digit;
        })
        .join("");
    }
    return str;
  };
  let stringValue = makeString(roundedNumber, pic.maximumFactionalPartSize);
  let decimalPos = stringValue.indexOf(".");
  if (decimalPos === -1) {
    stringValue += decimal_separator;
  } else {
    stringValue = stringValue.replace(".", decimal_separator);
  }
  while (stringValue.charAt(0) === zero_digit) {
    stringValue = stringValue.substring(1);
  }
  while (stringValue.charAt(stringValue.length - 1) === zero_digit) {
    stringValue = stringValue.substring(0, stringValue.length - 1);
  }
  // bullets 8 & 9:
  decimalPos = stringValue.indexOf(decimal_separator);
  let padLeft = pic.minimumIntegerPartSize - decimalPos;
  const padRight =
    pic.minimumFactionalPartSize - (stringValue.length - decimalPos - 1);
  stringValue =
    (padLeft > 0 ? new Array(padLeft + 1).join(zero_digit) : "") + stringValue;
  stringValue +=
    (padRight > 0 ? new Array(padRight + 1).join(zero_digit) : "");
  decimalPos = stringValue.indexOf(decimal_separator);
  // bullet 10:
  if (pic.regularGrouping > 0) {
    const groupCount = Math.floor((decimalPos - 1) / pic.regularGrouping);
    for (let group = 1; group <= groupCount; group++) {
      stringValue = [
        stringValue.slice(0, decimalPos - group * pic.regularGrouping),
        grouping_separator,
        stringValue.slice(decimalPos - group * pic.regularGrouping),
      ].join("");
    }
  } else {
    pic.integerPartGroupingPositions.forEach((pos) => {
      stringValue = [
        stringValue.slice(0, decimalPos - pos),
        grouping_separator,
        stringValue.slice(decimalPos - pos),
      ].join("");
      decimalPos++;
    });
  }
  // bullet 11:
  decimalPos = stringValue.indexOf(decimal_separator);
  pic.fractionalPartGroupingPositions.forEach((pos) => {
    stringValue = [
      stringValue.slice(0, pos + decimalPos + 1),
      grouping_separator,
      stringValue.slice(pos + decimalPos + 1),
    ].join("");
  });
  // bullet 12:
  decimalPos = stringValue.indexOf(decimal_separator);
  if (
    pic.picture.indexOf(decimal_separator) === -1 ||
    decimalPos === stringValue.length - 1
  ) {
    stringValue = stringValue.substring(0, stringValue.length - 1);
  }
  // bullet 13:
  if (typeof exponent !== "undefined") {
    let stringExponent = makeString(exponent, 0);
    padLeft = pic.minimumExponentSize - stringExponent.length;
    if (padLeft > 0) {
      stringExponent = new Array(padLeft + 1).join(zero_digit) + stringExponent;
    }
    stringValue =
      stringValue +
      properties["exponent-separator"] +
      (exponent < 0 ? minus_sign : "") +
      stringExponent;
  }
  // bullet 14:
  stringValue = pic.prefix + stringValue + pic.suffix;
  return stringValue;
}

/**
 * Converts a number to a string using a specified number base
 * @param {number} value - the number to convert
 * @param {number} [radix] - the number base; must be between 2 and 36. Defaults to 10
 * @returns {string} - the converted string
 */
export function formatBase(value, radix) {
  // undefined inputs always return undefined
  if (typeof value === "undefined") {
    return undefined;
  }

  value = round(value);

  if (typeof radix === "undefined") {
    radix = 10;
  } else {
    radix = round(radix);
  }

  if (radix < 2 || radix > 36) {
    throw {
      code: "D3100",
      stack: new Error().stack,
      value: radix,
    };
  }

  const result = value.toString(radix);

  return result;
}

/**
 * Cast argument to number
 * @param {Object} arg - Argument
 * @returns {Number} numeric value of argument
 */
export function number(arg) {
  let result;

  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  if (typeof arg === "number") {
    // already a number
    result = arg;
  } else if (
    typeof arg === "string" &&
    /^-?[0-9]+(\.[0-9]+)?([Ee][-+]?[0-9]+)?$/.test(arg) &&
    !Number.isNaN(Number.parseFloat(arg)) &&
    Number.
    isFinite(arg)
  ) {
    result = Number.parseFloat(arg);
  } else if (
    typeof arg === "string" &&
    /^(0[xX][0-9A-Fa-f]+)|(0[oO][0-7]+)|(0[bB][0-1]+)$/.test(arg)
  ) {
    result = Number(arg);
  } else if (arg === true) {
    // boolean true casts to 1
    result = 1;
  } else if (arg === false) {
    // boolean false casts to 0
    result = 0;
  } else {
    throw {
      code: "D3030",
      index: 1,
      stack: new Error().stack,
      value: arg,
    };
  }
  return result;
}

/**
 * Absolute value of a number
 * @param {Number} arg - Argument
 * @returns {Number} absolute value of argument
 */
export function abs(arg) {
  let result;

  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  result = Math.abs(arg);
  return result;
}

/**
 * Rounds a number down to integer
 * @param {Number} arg - Argument
 * @returns {Number} rounded integer
 */
export function floor(arg) {
  let result;

  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  result = Math.floor(arg);
  return result;
}

/**
 * Rounds a number up to integer
 * @param {Number} arg - Argument
 * @returns {Number} rounded integer
 */
export function ceil(arg) {
  let result;

  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  result = Math.ceil(arg);
  return result;
}

/**
 * Round to half even
 * @param {Number} arg - Argument
 * @param {Number} [precision] - number of decimal places
 * @returns {Number} rounded integer
 */
export function round(arg, precision) {
  let result;

  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  if (precision) {
    // shift the decimal place - this needs to be done in a string since multiplying
    // by a power of ten can introduce floating point precision errors which mess up
    // this rounding algorithm - See 'Decimal rounding' in
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
    // Shift
    const value = arg.toString().split("e");
    arg = +(value[0] + "e" + (value[1] ? +value[1] + precision : precision));
  }

  // round up to nearest int
  result = Math.round(arg);
  const diff = result - arg;
  if (Math.abs(diff) === 0.5 && Math.abs(result % 2) === 1) {
    // rounded the wrong way - adjust to nearest even number
    result -= 1;
  }
  if (precision) {
    // Shift back
    value = result.toString().split("e");
    /* istanbul ignore next */
    result = +(
      value[0] +
      "e" +
      (value[1] ? +value[1] - precision : -precision)
    );
  }
  if (Object.is(result, -0)) {
    // ESLint rule 'no-compare-neg-zero' suggests this way
    // JSON doesn't do -0
    result = 0;
  }
  return result;
}

/**
 * Square root of number
 * @param {Number} arg - Argument
 * @returns {Number} square root
 */
export function sqrt(arg) {
  let result;

  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  if (arg < 0) {
    throw {
      code: "D3060",
      index: 1,
      stack: new Error().stack,
      value: arg,
    };
  }

  result = Math.sqrt(arg);

  return result;
}

/**
 * Raises number to the power of the second number
 * @param {Number} arg - the base
 * @param {Number} exp - the exponent
 * @returns {Number} rounded integer
 */
export function power(arg, exp) {
  let result;

  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  result = arg ** exp;

  if (!Number.isFinite(result)) {
    throw {
      code: "D3061",
      exp: exp,
      index: 1,
      stack: new Error().stack,
      value: arg,
    };
  }

  return result;
}

/**
 * Returns a random number 0 <= n < 1
 * @returns {number} random number
 */
export function random() {
  return Math.random();
}

/**
 * Evaluate an input and return a boolean
 * @param {*} arg - Arguments
 * @returns {boolean} Boolean
 */
export function boolean(arg) {
  // cast arg to its effective boolean value
  // boolean: unchanged
  // string: zero-length -> false; otherwise -> true
  // number: 0 -> false; otherwise -> true
  // null -> false
  // array: empty -> false; length > 1 -> true
  // object: empty -> false; non-empty -> true
  // function -> false

  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  let result = false;
  if (Array.isArray(arg)) {
    if (arg.length === 1) {
      result = boolean(arg[0]);
    } else if (arg.length > 1) {
      const trues = arg.filter((val) => boolean(val));
      result = trues.length > 0;
    }
  } else if (typeof arg === "string") {
    if (arg.length > 0) {
      result = true;
    }
  } else if (isNumeric(arg)) {
    if (arg !== 0) {
      result = true;
    }
  } else if (arg !== null && typeof arg === "object") {
    if (Object.keys(arg).length > 0) {
      result = true;
    }
  } else if (typeof arg === "boolean" && arg === true) {
    result = true;
  }
  return result;
}

/**
 * returns the Boolean NOT of the arg
 * @param {*} arg - argument
 * @returns {boolean} - NOT arg
 */
export function not(arg) {
  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  return !boolean(arg);
}

/**
 * Helper function to build the arguments to be supplied to the function arg of the
 * HOFs map, filter, each, sift and single
 * @param {function} func - the function to be invoked
 * @param {*} arg1 - the first (required) arg - the value
 * @param {*} arg2 - the second (optional) arg - the position (index or key)
 * @param {*} arg3 - the third (optional) arg - the whole structure (array or object)
 * @returns {*[]} the argument list
 */
export function hofFuncArgs(func, arg1, arg2, arg3) {
  const func_args = [arg1]; // the first arg (the value) is required
  // the other two are optional - only supply it if the function can take it
  const length = getFunctionArity(func);
  if (length >= 2) {
    func_args.push(arg2);
  }
  if (length >= 3) {
    func_args.push(arg3);
  }
  return func_args;
}

/**
 * Create a map from an array of arguments
 * @param {Array} [arr] - array to map over
 * @param {Function} func - function to apply
 * @returns {Array} Map array
 */
export function map(arr, func) {
  // undefined inputs always return undefined
  if (typeof arr === "undefined") {
    return undefined;
  }

  const result = createSequence();
  // do the map - iterate over the arrays, and invoke func
  for (let i = 0; i < arr.length; i++) {
    const func_args = hofFuncArgs(func, arr[i], i, arr);
    // invoke func
    const res = func.apply(this, func_args);
    if (typeof res !== "undefined") {
      result.push(res);
    }
  }

  return result;
}

/**
 * Create a map from an array of arguments
 * @param {Array} [arr] - array to filter
 * @param {Function} func - predicate function
 * @returns {Array} Map array
 */
export function filter(arr, func) {
  // undefined inputs always return undefined
  if (typeof arr === "undefined") {
    return undefined;
  }

  const result = createSequence();

  for (let i = 0; i < arr.length; i++) {
    const entry = arr[i];
    const func_args = hofFuncArgs(func, entry, i, arr);
    // invoke func
    const res = func.apply(this, func_args);
    if (boolean(res)) {
      result.push(entry);
    }
  }

  return result;
}

/**
 * Given an array, find the single element matching a specified condition
 * Throws an exception if the number of matching elements is not exactly one
 * @param {Array} [arr] - array to filter
 * @param {Function} [func] - predicate function
 * @returns {*} Matching element
 */
export function single(arr, func) {
  // undefined inputs always return undefined
  if (typeof arr === "undefined") {
    return undefined;
  }

  let hasFoundMatch = false;
  let result;

  for (let i = 0; i < arr.length; i++) {
    const entry = arr[i];
    let positiveResult = true;
    if (typeof func !== "undefined") {
      const func_args = hofFuncArgs(func, entry, i, arr);
      // invoke func
      const res = func.apply(this, func_args);
      positiveResult = boolean(res);
    }
    if (positiveResult) {
      if (hasFoundMatch) {
        throw {
          code: "D3138",
          index: i,
          stack: new Error().stack,
        };
      }
        result = entry;
        hasFoundMatch = true;
    }
  }

  if (!hasFoundMatch) {
    throw {
      code: "D3139",
      stack: new Error().stack,
    };
  }

  return result;
}

/**
 * Convolves (zips) each value from a set of arrays
 * @param {Array} [args] - arrays to zip
 * @returns {Array} Zipped array
 */
export function zip() {
  // this can take a variable number of arguments
  const result = [];
  const args = Array.prototype.slice.call(arguments);
  // length of the shortest array
  const length = Math.min.apply(
    Math,
    args.map((arg) => {
      if (Array.isArray(arg)) {
        return arg.length;
      }
      return 0;
    }),
  );
  for (let i = 0; i < length; i++) {
    const tuple = args.map((arg) => {
      return arg[i];
    });
    result.push(tuple);
  }
  return result;
}

/**
 * Fold left function
 * @param {Array} sequence - Sequence
 * @param {Function} func - Function
 * @param {Object} init - Initial value
 * @returns {*} Result
 */
export function foldLeft(sequence, func, init) {
  // undefined inputs always return undefined
  if (typeof sequence === "undefined") {
    return undefined;
  }

  let result;

  const arity = getFunctionArity(func);
  if (arity < 2) {
    throw {
      code: "D3050",
      index: 1,
      stack: new Error().stack,
    };
  }

  let index;
  if (typeof init === "undefined" && sequence.length > 0) {
    result = sequence[0];
    index = 1;
  } else {
    result = init;
    index = 0;
  }

  while (index < sequence.length) {
    const args = [result, sequence[index]];
    if (arity >= 3) {
      args.push(index);
    }
    if (arity >= 4) {
      args.push(sequence);
    }
    result = func.apply(this, args);
    index++;
  }

  return result;
}

/**
 * Return keys for an object
 * @param {Object} arg - Object
 * @returns {Array} Array of keys
 */
export function keys(arg) {
  let result = createSequence();

  if (Array.isArray(arg)) {
    // merge the keys of all of the items in the array
    const merge = {};
    arg.forEach((item) => {
      const allkeys = keys(item);
      allkeys.forEach((key) => {
        merge[key] = true;
      });
    });
    result = keys(merge);
  } else if (arg !== null && typeof arg === "object" && !isLambda(arg)) {
    Object.keys(arg).forEach((key) => result.push(key));
  }
  return result;
}

/**
 * Return value from an object for a given key
 * @param {Object} input - Object/Array
 * @param {String} key - Key in object
 * @returns {*} Value of key in object
 */
export function lookup(input, key) {
  // lookup the 'name' item in the input
  let result;
  if (Array.isArray(input)) {
    result = createSequence();
    for (let ii = 0; ii < input.length; ii++) {
      const res = lookup(input[ii], key);
      if (typeof res !== "undefined") {
        if (Array.isArray(res)) {
          res.forEach((val) => result.push(val));
        } else {
          result.push(res);
        }
      }
    }
  } else if (input !== null && typeof input === "object") {
    result = input[key];
  }
  return result;
}

/**
 * Append second argument to first
 * @param {Array|Object} arg1 - First argument
 * @param {Array|Object} arg2 - Second argument
 * @returns {*} Appended arguments
 */
export function append(arg1, arg2) {
  // disregard undefined args
  if (typeof arg1 === "undefined") {
    return arg2;
  }
  if (typeof arg2 === "undefined") {
    return arg1;
  }
  // if either argument is not an array, make it so
  if (!Array.isArray(arg1)) {
    arg1 = createSequence(arg1);
  }
  if (!Array.isArray(arg2)) {
    arg2 = [arg2];
  }
  return arg1.concat(arg2);
}

/**
 * Determines if the argument is undefined
 * @param {*} arg - argument
 * @returns {boolean} False if argument undefined, otherwise true
 */
export function exists(arg) {
  if (typeof arg === "undefined") {
    return false;
  }
    return true;
}

/**
 * Splits an object into an array of object with one property each
 * @param {*} arg - the object to split
 * @returns {*} - the array
 */
export function spread(arg) {
  let result = createSequence();

  if (Array.isArray(arg)) {
    // spread all of the items in the array
    arg.forEach((item) => {
      result = append(result, spread(item));
    });
  } else if (arg !== null && typeof arg === "object" && !isLambda(arg)) {
    for (const key in arg) {
      const obj = {};
      obj[key] = arg[key];
      result.push(obj);
    }
  } else {
    result = arg;
  }
  return result;
}

/**
 * Merges an array of objects into a single object.  Duplicate properties are
 * overridden by entries later in the array
 * @param {*} arg - the objects to merge
 * @returns {*} - the object
 */
export function merge(arg) {
  // undefined inputs always return undefined
  if (typeof arg === "undefined") {
    return undefined;
  }

  const result = {};

  arg.forEach((obj) => {
    for (const prop in obj) {
      result[prop] = obj[prop];
    }
  });
  return result;
}

/**
 * Reverses the order of items in an array
 * @param {Array} arr - the array to reverse
 * @returns {Array} - the reversed array
 */
export function reverse(arr) {
  // undefined inputs always return undefined
  if (typeof arr === "undefined") {
    return undefined;
  }

  if (arr.length <= 1) {
    return arr;
  }

  const length = arr.length;
  const result = new Array(length);
  for (let i = 0; i < length; i++) {
    result[length - i - 1] = arr[i];
  }

  return result;
}

/**
 *
 * @param {*} obj - the input object to iterate over
 * @param {*} func - the function to apply to each key/value pair
 * @returns {Array} - the resultant array
 */
export function each(obj, func) {
  const result = createSequence();

  for (const key in obj) {
    const func_args = hofFuncArgs(func, obj[key], key, obj);
    // invoke func
    const val = func.apply(this, func_args);
    if (typeof val !== "undefined") {
      result.push(val);
    }
  }

  return result;
}

/**
 *
 * @param {string} [message] - the message to attach to the error
 * @throws custom error with code 'D3137'
 */
export function error(message) {
  throw {
    code: "D3137",
    message: message || "$error() function evaluated",
    stack: new Error().stack,
  };
}

/**
 *
 * @param {boolean} condition - the condition to evaluate
 * @param {string} [message] - the message to attach to the error
 * @throws custom error with code 'D3137'
 * @returns {undefined}
 */
export function assert(condition, message) {
  if (!condition) {
    throw {
      code: "D3141",
      message: message || "$assert() statement failed",
      stack: new Error().stack,
    };
  }

  return undefined;
}

/**
 *
 * @param {*} [value] - the input to which the type will be checked
 * @returns {string} - the type of the input
 */
export function type(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return "null";
  }

  if (isNumeric(value)) {
    return "number";
  }

  if (typeof value === "string") {
    return "string";
  }

  if (typeof value === "boolean") {
    return "boolean";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  if (isFunction(value)) {
    return "function";
  }

  return "object";
}

/**
 * Implements the merge sort (stable) with optional comparator function
 *
 * @param {Array} arr - the array to sort
 * @param {*} comparator - comparator function
 * @returns {Array} - sorted array
 */
export function sort(arr, comparator) {
  // undefined inputs always return undefined
  if (typeof arr === "undefined") {
    return undefined;
  }

  if (arr.length <= 1) {
    return arr;
  }

  let comp;
  if (typeof comparator === "undefined") {
    // inject a default comparator - only works for numeric or string arrays
    if (!(isArrayOfNumbers(arr) || isArrayOfStrings(arr))) {
      throw {
        code: "D3070",
        index: 1,
        stack: new Error().stack,
      };
    }

    comp = (a, b) => a > b;
  } else {
    // for internal usage of functionSort (i.e. order-by syntax)
    comp = comparator;
  }

  const merge = (l, r) => {
    const merge_iter = (result, left, right) => {
      if (left.length === 0) {
        Array.prototype.push.apply(result, right);
      } else if (right.length === 0) {
        Array.prototype.push.apply(result, left);
      } else if (comp(left[0], right[0])) {
        // invoke the comparator function
        // if it returns true - swap left and right
        result.push(right[0]);
        merge_iter(result, left, right.slice(1));
      } else {
        // otherwise keep the same order
        result.push(left[0]);
        merge_iter(result, left.slice(1), right);
      }
    };
    const merged = [];
    merge_iter(merged, l, r);
    return merged;
  };

  const msort = (array) => {
    if (!Array.isArray(array) || array.length <= 1) {
      return array;
    }
      const middle = Math.floor(array.length / 2);
      let left = array.slice(0, middle);
      let right = array.slice(middle);
      left = msort(left);
      right = msort(right);
      return merge(left, right);
  };

  const result = msort(arr);

  return result;
}

/**
 * Randomly shuffles the contents of an array
 * @param {Array} arr - the input array
 * @returns {Array} the shuffled array
 */
export function shuffle(arr) {
  // undefined inputs always return undefined
  if (typeof arr === "undefined") {
    return undefined;
  }

  if (arr.length <= 1) {
    return arr;
  }

  // shuffle using the 'inside-out' variant of the Fisher-Yates algorithm
  const result = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    const j = Math.floor(Math.random() * (i + 1)); // random integer such that 0 ≤ j ≤ i
    if (i !== j) {
      result[i] = result[j];
    }
    result[j] = arr[i];
  }

  return result;
}

/**
 * Returns the values that appear in a sequence, with duplicates eliminated.
 * @param {Array} arr - An array or sequence of values
 * @returns {Array} - sequence of distinct values
 */
export function distinct(arr) {
  // undefined inputs always return undefined
  if (typeof arr === "undefined") {
    return undefined;
  }

  if (!Array.isArray(arr) || arr.length <= 1) {
    return arr;
  }

  const results = isSequence(arr) ? createSequence() : [];

  for (let ii = 0; ii < arr.length; ii++) {
    const value = arr[ii];
    // is this value already in the result sequence?
    let includes = false;
    for (let jj = 0; jj < results.length; jj++) {
      if (deepEquals(value, results[jj])) {
        includes = true;
        break;
      }
    }
    if (!includes) {
      results.push(value);
    }
  }
  return results;
}

/**
 * Applies a predicate function to each key/value pair in an object, and returns an object containing
 * only the key/value pairs that passed the predicate
 *
 * @param {object} arg - the object to be sifted
 * @param {object} func - the predicate function (lambda or native)
 * @returns {object} - sifted object
 */
export function sift(arg, func) {
  let result = {};

  for (const item in arg) {
    const entry = arg[item];
    const func_args = hofFuncArgs(func, entry, item, arg);
    // invoke func
    const res = func.apply(this, func_args);
    if (boolean(res)) {
      result[item] = entry;
    }
  }

  // empty objects should be changed to undefined
  if (Object.keys(result).length === 0) {
    result = undefined;
  }

  return result;
}
