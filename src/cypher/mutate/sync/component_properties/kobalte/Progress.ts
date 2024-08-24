export const Progress = [
  {
    "description": "The progress value.",
    "property": "value",
    "type": "number"
  },
  {
    "description": "The minimum progress value.",
    "property": "minValue",
    "type": "number"
  },
  {
    "description": "The maximum progress value.",
    "property": "maxValue",
    "type": "number"
  },
  {
    "description": "Whether the progress is in an indeterminate state.",
    "property": "indeterminate",
    "type": "boolean"
  },
  {
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "property": "getValueLabel",
    "type": "(params: { value: number; min: number; max: number }) => string"
  }
];