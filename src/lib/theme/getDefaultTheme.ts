// https://github.com/saadeghi/daisyui/blob/master/src/theming/themes.js
// https://github.com/saadeghi/daisyui/blob/master/src/base/colors.css
export function getDefaultTheme() {
  return `return {
  "variables": {
    "primary": variables.sky,
    "secondary": variables.gray,
    "accent": variables.amber,
    "neutral": variables.beryl,
    "base": variables.slate, // use base-5, base-10, base-20
    "info": variables.blue,
    "success": variables.green,
    "warning": variables.yellow,
    "error": variables.red
  }
}`;
}
