export const Progress = [
  {
    "componentName": "number",
    "description": "The progress value.",
    "property": "value"
  },
  {
    "componentName": "number",
    "description": "The minimum progress value.",
    "property": "minValue"
  },
  {
    "componentName": "number",
    "description": "The maximum progress value.",
    "property": "maxValue"
  },
  {
    "componentName": "boolean",
    "description": "Whether the progress is in an indeterminate state.",
    "property": "indeterminate"
  },
  {
    "componentName": "(params: { value: number; min: number; max: number }) => string",
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "property": "getValueLabel"
  }
];