export const Progress = [
  {
    "componentName": "number",
    "description": "The progress value.",
    "name": "value",
    "hashName": "progress-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum progress value.",
    "name": "minValue",
    "hashName": "progress-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The maximum progress value.",
    "name": "maxValue",
    "hashName": "progress-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the progress is in an indeterminate state.",
    "name": "indeterminate",
    "hashName": "progress-1",
    "kobalte": true
  },
  {
    "componentName": "(params: { value: number; min: number; max: number }) => string",
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "name": "getValueLabel",
    "hashName": "progress-1",
    "kobalte": true
  }
];