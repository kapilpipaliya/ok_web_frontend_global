/* eslint-disable perfectionist/sort-objects */

// https://github.com/saadeghi/daisyui/blob/master/src/theming/themes.js
// https://github.com/saadeghi/daisyui/blob/master/src/base/colors.css
export function getDefaultTheme() {
  return JSON.stringify({
    variables: {
      primary: 'sky',
      secondary: 'gray',
      accent: 'amber',
      neutral: { '@dark': "#373737", '@light': "#3b8ac4" },
      "base-100": { '@dark': "#000000", '@light': "#345da7" },
      "base-200": { '@dark': "#141414", '@light': "oklch(100% 0 0)" },
      "base-300": { '@dark': "#262626", '@light': "oklch(100% 0 0)" },
      info: 'blue',
      success: 'green',
      warning: 'yellow',
      error: 'red',
    }
  });
}
