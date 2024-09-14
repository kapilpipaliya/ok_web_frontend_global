export const Progress = [
  {
    "componentName": "number",
    "description": "The progress value.",
    "hashName": "progress-1",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum progress value.",
    "hashName": "progress-1",
    "key": "minValue",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The maximum progress value.",
    "hashName": "progress-1",
    "key": "maxValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the progress is in an indeterminate state.",
    "hashName": "progress-1",
    "key": "indeterminate",
    "kobalte": true
  },
  {
    "componentName": "(params: { value: number; min: number; max: number }) => string",
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "hashName": "progress-1",
    "key": "getValueLabel",
    "kobalte": true
  }
];