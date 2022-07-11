import { defineConfig } from "unocss/vite";
import presetUno from '@unocss/preset-uno'
import { presetDue } from 'duecss'
export default defineConfig({
  // duecss config:
  theme: {
    colors: {
      primary: {
        DEFAULT: '#943D40',
        50: '#DDACAE',
        100: '#D79D9F',
        200: '#CB8183',
        300: '#BF6467',
        400: '#B1494C',
        500: '#943D40',
        600: '#6C2D2F',
        700: '#451C1E',
        800: '#1D0C0C',
        900: '#000000'
      },
      accent: {
        DEFAULT: '#C3A19D',
        50: '#FFFFFF',
        100: '#FFFFFF',
        200: '#F1EAE9',
        300: '#E2D2D0',
        400: '#D2B9B6',
        500: '#C3A19D',
        600: '#AE807A',
        700: '#95615B',
        800: '#724A46',
        900: '#4F3430'
      }
    }
  },
  presets: [presetUno(), presetDue()]
})