/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-maps */
// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
 * Copyright (C) 2010 Nikita Vasilyev. All rights reserved.
 * Copyright (C) 2010 Joseph Pecoraro. All rights reserved.
 * Copyright (C) 2010 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the #name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/core/sdk/CSSMetadata.ts#L341C1-L341C90

// CSS-wide keywords.
// Spec: https://drafts.csswg.org/css-cascade/#defaulting-keywords
// https://drafts.csswg.org/css-cascade-5/#revert-layer

// import { BORDER_STYLE_VALUES } from "@master/css";
const BORDER_STYLE_VALUES = ["hidden", "inset", "groove", "ridge", "outset", "dotted", "dashed", "solid", "double"];

export const CSSWideKeywords = [
  "inherit",
  "initial",
  "revert",
  "revert-layer",
  "unset",
];

/**
 * The pipe character '|' indicates where text selection should be set.
 */
const imageValuePresetMap = new Map([
  ["linear-gradient", "linear-gradient(|45deg, black, transparent|)"],
  ["radial-gradient", "radial-gradient(|black, transparent|)"],
  [
    "repeating-linear-gradient",
    "repeating-linear-gradient(|45deg, black, transparent 100px|)",
  ],
  [
    "repeating-radial-gradient",
    "repeating-radial-gradient(|black, transparent 100px|)",
  ],
  ["url", "url(||)"],
]);

const filterValuePresetMap = new Map([
  ["blur", "blur(|1px|)"],
  ["brightness", "brightness(|0.5|)"],
  ["contrast", "contrast(|0.5|)"],
  ["drop-shadow", "drop-shadow(|2px 4px 6px black|)"],
  ["grayscale", "grayscale(|1|)"],
  ["hue-rotate", "hue-rotate(|45deg|)"],
  ["invert", "invert(|1|)"],
  ["opacity", "opacity(|0.5|)"],
  ["saturate", "saturate(|0.5|)"],
  ["sepia", "sepia(|1|)"],
  ["url", "url(||)"],
]);

const _valuePresets = new Map([
  ["filter", filterValuePresetMap],
  ["backdrop-filter", filterValuePresetMap],
  ["background", imageValuePresetMap],
  ["background-image", imageValuePresetMap],
  [
    "transform",
    new Map([
      ["scale", "scale(|1.5|)"],
      ["scaleX", "scaleX(|1.5|)"],
      ["scaleY", "scaleY(|1.5|)"],
      ["scale3d", "scale3d(|1.5, 1.5, 1.5|)"],
      ["rotate", "rotate(|45deg|)"],
      ["rotateX", "rotateX(|45deg|)"],
      ["rotateY", "rotateY(|45deg|)"],
      ["rotateZ", "rotateZ(|45deg|)"],
      ["rotate3d", "rotate3d(|1, 1, 1, 45deg|)"],
      ["skew", "skew(|10deg, 10deg|)"],
      ["skewX", "skewX(|10deg|)"],
      ["skewY", "skewY(|10deg|)"],
      ["translate", "translate(|10px, 10px|)"],
      ["translateX", "translateX(|10px|)"],
      ["translateY", "translateY(|10px|)"],
      ["translateZ", "translateZ(|10px|)"],
      ["translate3d", "translate3d(|10px, 10px, 10px|)"],
      ["matrix", "matrix(|1, 0, 0, 1, 0, 0|)"],
      [
        "matrix3d",
        "matrix3d(|1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1|)",
      ],
      ["perspective", "perspective(|10px|)"],
    ]),
  ],
]);

const _distanceProperties = new Set<string>([
  "background-position",
  "border-spacing",
  "bottom",
  "font-size",
  "grid-column-gap",
  "grid-row-gap",
  "height",
  "left",
  "letter-spacing",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "right",
  "row-gap",
  "text-indent",
  "top",
  "width",
  "word-spacing",
]);

const _bezierAwareProperties = new Set<string>([
  "animation",
  "animation-timing-function",
  "transition",
  "transition-timing-function",
]);

const _fontAwareProperties = new Set<string>([
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
  "line-height",
]);

const _colorAwareProperties = new Set<string>([
  "accent-color",
  "background",
  "background-color",
  "background-image",
  "border",
  "border-block-end",
  "border-block-end-color",
  "border-block-start",
  "border-block-start-color",
  "border-bottom",
  "border-bottom-color",
  "border-color",
  "border-image",
  "border-image-source",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-start",
  "border-inline-start-color",
  "border-left",
  "border-left-color",
  "border-right",
  "border-right-color",
  "border-top",
  "border-top-color",
  "box-shadow",
  "caret-color",
  "color",
  "column-rule",
  "column-rule-color",
  "content",
  "fill",
  "list-style-image",
  "mask",
  "mask-border",
  "mask-border-source",
  "mask-image",
  "outline",
  "outline-color",
  "scrollbar-color",
  "stop-color",
  "stroke",
  "text-decoration-color",
  "text-shadow",
]);

// In addition to `_colorAwareProperties`, the following properties contain CSS <angle> units.
const _angleAwareProperties = new Set<string>([
  "backdrop-filter",

  "filter",
  "font-style",

  "offset",
  "offset-rotate",
  "rotate",
  "transform",
]);

const borderValues = [
  "hidden",
  "inset",
  "groove",
  "outset",
  "ridge",
  "dotted",
  "dashed",
  "solid",
  "double",
  "medium",
  "thick",
  "thin",
];
// manually maintained list of property #values to add into autocomplete list
export const extraPropertyValues = {
  "background-repeat": {
    values: ["repeat", "repeat-x", "repeat-y", "no-repeat", "space", "round"],
  },
  content: {
    values: [
      "normal",
      "close-quote",
      "no-close-quote",
      "no-open-quote",
      "open-quote",
    ],
  },
  "baseline-shift": { values: ["baseline"] },
  "max-height": { values: ["min-content", "max-content", "fit-content"] },
  color: { values: ["black"] },
  "background-color": { values: ["white"] },
  "box-shadow": { values: ["inset"] },
  "text-shadow": { values: ["0 0 black"] },
  "writing-mode": { values: ["lr", "rl", "tb", "lr-tb", "rl-tb", "tb-rl"] },
  "page-break-inside": { values: ["avoid"] },
  "border-width": { values: ["medium", "thick", "thin"] },
  //'border-style': {values: ['hidden', 'inset', 'groove', 'ridge', 'outset', 'dotted', 'dashed', 'solid', 'double']},
  "border-style": { values: BORDER_STYLE_VALUES },
  size: {
    values: [
      "a3",
      "a4",
      "a5",
      "b4",
      "b5",
      "landscape",
      "ledger",
      "legal",
      "letter",
      "portrait",
    ],
  },
  // modified
  overflow: { values: ["hidden", "visible", "clip", "scroll", "auto"] },
  "overscroll-behavior": { values: ["contain"] },
  "text-rendering": {
    values: ["optimizeSpeed", "optimizeLegibility", "geometricPrecision"],
  },
  "clip-path": { values: ["circle", "ellipse", "inset", "polygon", "url"] },
  "color-interpolation": { values: ["sRGB", "linearRGB"] },
  "word-wrap": { values: ["normal", "break-word"] },
  "font-weight": {
    values: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  "color-rendering": { values: ["optimizeSpeed", "optimizeQuality"] },
  "text-orientation": { values: ["sideways-right"] },
  outline: {
    values: [
      "inset",
      "groove",
      "ridge",
      "outset",
      "dotted",
      "dashed",
      "solid",
      "double",
      "medium",
      "thick",
      "thin",
    ],
  },
  font: {
    values: [
      "caption",
      "icon",
      "menu",
      "message-box",
      "small-caption",

      "status-bar",
    ],
  },
  "dominant-baseline": {
    values: [
      "text-before-edge",
      "text-after-edge",
      "use-script",
      "no-change",
      "reset-size",
    ],
  },
  "alignment-baseline": {
    values: [
      "before-edge",
      "after-edge",
      "text-before-edge",
      "text-after-edge",
      "hanging",
    ],
  },
  "page-break-before": { values: ["left", "right", "always", "avoid"] },
  "border-image": { values: ["repeat", "stretch", "space", "round"] },
  "text-decoration": {
    values: [
      "blink",
      "line-through",
      "overline",
      "underline",
      "wavy",
      "double",
      "solid",
      "dashed",
      "dotted",
    ],
  },
  // List taken from https://drafts.csswg.org/css-fonts-4/#generic-font-families
  "font-family": {
    values: [
      "serif",
      "sans-serif",
      "cursive",
      "fantasy",
      "monospace",
      "system-ui",
      "emoji",
      "math",
      "fangsong",
      "ui-serif",
      "ui-sans-serif",
      "ui-monospace",
      "ui-rounded",
    ],
  },
  zoom: { values: ["normal"] },
  "max-width": { values: ["min-content", "max-content", "fit-content"] },
  border: {
    values: [
      "hidden",
      "inset",
      "groove",
      "ridge",
      "outset",
      "dotted",
      "dashed",
      "solid",
      "double",
      "medium",
      "thick",
      "thin",
    ],
  },
  "font-variant": {
    values: [
      "small-caps",
      "normal",
      "common-ligatures",
      "no-common-ligatures",
      "discretionary-ligatures",
      "no-discretionary-ligatures",
      "historical-ligatures",
      "no-historical-ligatures",
      "contextual",
      "no-contextual",
      "all-small-caps",
      "petite-caps",
      "all-petite-caps",
      "unicase",
      "titling-caps",
      "lining-nums",
      "oldstyle-nums",
      "proportional-nums",
      "tabular-nums",
      "diagonal-fractions",
      "stacked-fractions",
      "ordinal",
      "slashed-zero",
      "jis78",
      "jis83",
      "jis90",
      "jis04",
      "simplified",
      "traditional",
      "full-width",
      "proportional-width",
      "ruby",
    ],
  },
  // added options: middle, baseline, sub, super, text-top, text-bottom
  "vertical-align": {
    values: [
      "top",
      "bottom",
      "middle",
      "baseline",
      "sub",
      "super",
      "text-top",
      "text-bottom",
    ],
  },
  // added:
  resize: {
    values: ["none", "both", "horizontal", "vertical", "inline", "block"],
  },
  "page-break-after": { values: ["left", "right", "always", "avoid"] },
  transform: {
    values: [
      "scale",
      "scaleX",
      "scaleY",
      "scale3d",
      "rotate",
      "rotateX",
      "rotateY",
      "rotateZ",
      "rotate3d",
      "skew",
      "skewX",
      "skewY",
      "translate",
      "translateX",
      "translateY",
      "translateZ",
      "translate3d",
      "matrix",
      "matrix3d",
      "perspective",
    ],
  },
  "align-content": {
    values: [
      "normal",
      "baseline",
      "space-between",
      "space-around",
      "space-evenly",
      "stretch",
      "center",
      "start",
      "end",
      "flex-start",
      "flex-end",
    ],
  },
  "justify-content": {
    values: [
      "normal",
      "space-between",
      "space-around",
      "space-evenly",
      "stretch",
      "center",
      "start",
      "end",
      "flex-start",
      "flex-end",
      "left",
      "right",
    ],
  },
  "place-content": {
    values: [
      "normal",
      "space-between",
      "space-around",
      "space-evenly",
      "stretch",
      "center",
      "start",
      "end",
      "flex-start",
      "flex-end",
      "baseline",
    ],
  },
  "align-items": {
    values: [
      "normal",
      "stretch",
      "baseline",
      "center",
      "start",
      "end",
      "self-start",
      "self-end",
      "flex-start",
      "flex-end",
    ],
  },
  "justify-items": {
    values: [
      "normal",
      "stretch",
      "baseline",
      "center",
      "start",
      "end",
      "self-start",
      "self-end",
      "flex-start",
      "flex-end",
      "left",
      "right",
      "legacy",
    ],
  },
  "place-items": {
    values: [
      "normal",
      "stretch",
      "baseline",
      "center",
      "start",
      "end",
      "self-start",
      "self-end",
      "flex-start",
      "flex-end",
    ],
  },
  "align-self": {
    values: [
      "normal",
      "stretch",
      "baseline",
      "center",
      "start",
      "end",
      "self-start",
      "self-end",
      "flex-start",
      "flex-end",
    ],
  },
  "justify-self": {
    values: [
      "normal",
      "stretch",
      "baseline",
      "center",
      "start",
      "end",
      "self-start",
      "self-end",
      "flex-start",
      "flex-end",
      "left",
      "right",
    ],
  },
  "place-self": {
    values: [
      "normal",
      "stretch",
      "baseline",
      "center",
      "start",
      "end",
      "self-start",
      "self-end",
      "flex-start",
      "flex-end",
    ],
  },
  "perspective-origin": {
    values: ["left", "center", "right", "top", "bottom"],
  },
  "transform-origin": { values: ["left", "center", "right", "top", "bottom"] },
  "transition-timing-function": { values: ["cubic-bezier", "steps"] },
  "animation-timing-function": { values: ["cubic-bezier", "steps"] },
  filter: {
    values: [
      "url",
      "blur",
      "brightness",
      "contrast",
      "drop-shadow",
      "grayscale",
      "hue-rotate",
      "invert",
      "opacity",
      "saturate",
      "sepia",
    ],
  },
  "backdrop-filter": {
    values: [
      "url",
      "blur",
      "brightness",
      "contrast",
      "drop-shadow",
      "grayscale",
      "hue-rotate",
      "invert",
      "opacity",
      "saturate",
      "sepia",
    ],
  },
  "grid-template-columns": { values: ["min-content", "max-content"] },
  "grid-template-rows": { values: ["min-content", "max-content"] },
  // modified
  "grid-auto-flow": {
    values: ["row", "column", "dense", "row dense", "column dense"],
  },
  background: {
    values: [
      "repeat",
      "repeat-x",
      "repeat-y",
      "no-repeat",
      "top",
      "bottom",
      "left",
      "right",
      "center",
      "fixed",
      "local",
      "scroll",
      "space",
      "round",
      "border-box",
      "content-box",
      "padding-box",
      "linear-gradient",
      "radial-gradient",
      "repeating-linear-gradient",
      "repeating-radial-gradient",
      "url",
    ],
  },
  "background-image": {
    values: [
      "linear-gradient",
      "radial-gradient",
      "repeating-linear-gradient",
      "repeating-radial-gradient",
      "url",
    ],
  },
  "background-position": {
    values: ["top", "bottom", "left", "right", "center"],
  },
  "background-position-x": { values: ["left", "right", "center"] },
  "background-position-y": { values: ["top", "bottom", "center"] },
  "background-repeat-x": { values: ["repeat", "no-repeat"] },
  "background-repeat-y": { values: ["repeat", "no-repeat"] },
  "border-bottom": {
    values: borderValues,
  },
  "border-left": {
    values: borderValues,
  },
  "border-right": {
    values: borderValues,
  },
  "border-top": {
    values: borderValues,
  },
  "buffered-rendering": { values: ["static", "dynamic"] },
  "color-interpolation-filters": { values: ["srgb", "linearrgb"] },
  "column-rule": {
    values: borderValues,
  },
  "flex-flow": {
    values: [
      "nowrap",
      "row",
      "row-reverse",
      "column",
      "column-reverse",
      "wrap",
      "wrap-reverse",
    ],
  },
  "inline-size": { values: ["min-content", "max-content", "fit-content"] },
  "list-style": {
    values: [
      "outside",
      "inside",
      "disc",
      "circle",
      "square",
      "decimal",
      "decimal-leading-zero",
      "arabic-indic",
      "bengali",
      "cambodian",
      "khmer",
      "devanagari",
      "gujarati",
      "gurmukhi",
      "kannada",
      "lao",
      "malayalam",
      "mongolian",
      "myanmar",
      "oriya",
      "persian",
      "urdu",
      "telugu",
      "tibetan",
      "thai",
      "lower-roman",
      "upper-roman",
      "lower-greek",
      "lower-alpha",
      "lower-latin",
      "upper-alpha",
      "upper-latin",
      "cjk-earthly-branch",
      "cjk-heavenly-stem",
      "ethiopic-halehame",
      "ethiopic-halehame-am",
      "ethiopic-halehame-ti-er",
      "ethiopic-halehame-ti-et",
      "hangul",
      "hangul-consonant",
      "korean-hangul-formal",
      "korean-hanja-formal",
      "korean-hanja-informal",
      "hebrew",
      "armenian",
      "lower-armenian",
      "upper-armenian",
      "georgian",
      "cjk-ideographic",
      "simp-chinese-formal",
      "simp-chinese-informal",
      "trad-chinese-formal",
      "trad-chinese-informal",
      "hiragana",
      "katakana",
      "hiragana-iroha",
      "katakana-iroha",
    ],
  },
  "max-block-size": { values: ["min-content", "max-content", "fit-content"] },
  "max-inline-size": { values: ["min-content", "max-content", "fit-content"] },
  "min-block-size": { values: ["min-content", "max-content", "fit-content"] },
  "min-height": { values: ["min-content", "max-content", "fit-content"] },
  "min-inline-size": { values: ["min-content", "max-content", "fit-content"] },
  "min-width": { values: ["min-content", "max-content", "fit-content"] },
  "object-position": { values: ["top", "bottom", "left", "right", "center"] },
  "shape-outside": {
    values: ["border-box", "content-box", "padding-box", "margin-box"],
  },
  "contain-intrinsic-width": { values: ["auto none", "auto 100px"] },
  "contain-intrinsic-height": { values: ["auto none", "auto 100px"] },
  "contain-intrinsic-size": { values: ["auto none", "auto 100px"] },
  "contain-intrinsic-inline-size": { values: ["auto none", "auto 100px"] },
  "contain-intrinsic-block-size": { values: ["auto none", "auto 100px"] },
  // Due to some compatibility issues[1] with Chrome's implementation[2],
  // only a few legacy values are added here.
  // [1]: https://github.com/w3c/csswg-drafts/issues/9102#issuecomment-1807453214
  // [2]: https://chromium-review.googlesource.com/c/chromium/src/+/4232738
  "white-space": {
    values: [
      "normal", // equal to: `collapse wrap`
      "pre", // equal to: `preserve nowrap`
      "pre-wrap", // equal to: `preserve wrap`
      "pre-line", // equal to: `preserve-breaks wrap`
      "nowrap", // equal to: `collapse nowrap`
      "break-spaces", // equal to: `break-spaces wrap`, Chrome 76, crbug.com/767634#c28
    ],
  },
};

// Weight of CSS properties based on their usage from https://www.chromestatus.com/metrics/css/popularity

// Common keywords to CSS properties
const _CommonKeywords = ["auto", "none"];
