export const Image = [
  {
    "componentName": "number",
    "description": "The delay (in ms) before displaying the image fallback. Useful if you notice a flash during loading for delaying rendering, so it only appears for those with slower internet connections.",
    "name": "fallbackDelay",
    "hashName": "image-1",
    "kobalte": true
  },
  {
    "componentName": "(status: \"idle\" | \"loading\" | \"loaded\" | \"error\") => void",
    "description": "A callback providing information about the loading status of the image. This is useful in case you want to control more precisely what to render as the image is loading.",
    "name": "onLoadingStatusChange",
    "hashName": "image-1",
    "kobalte": true
  }
];