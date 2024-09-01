export const Progress = [
  {
    "componentName": "number",
    "description": "The progress value.",
    "key": "value",
    "hashName": "progress-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum progress value.",
    "key": "minValue",
    "hashName": "progress-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The maximum progress value.",
    "key": "maxValue",
    "hashName": "progress-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the progress is in an indeterminate state.",
    "key": "indeterminate",
    "hashName": "progress-1",
    "kobalte": true
  },
  {
    "componentName": "(params: { value: number; min: number; max: number }) => string",
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "key": "getValueLabel",
    "hashName": "progress-1",
    "kobalte": true
  }
];