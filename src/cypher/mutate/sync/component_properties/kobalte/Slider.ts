export const Slider = [
  {
    "componentName": "number[]",
    "description": "The controlled values of the slider. Must be used in conjunction with onChange.",
    "name": "value",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number[]",
    "description": "The value of the slider when initially rendered. Use when you do not need to control the state of the slider.",
    "name": "defaultValue",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "(value: number[]) => void",
    "description": "Event handler called when the value changes.",
    "name": "onChange",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "(value: number[]) => void",
    "description": "Event handler called when the value changes at the end of an interaction.",
    "name": "onChangeEnd",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the slider is visually inverted. Defaults to false.",
    "name": "inverted",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum slider value. Defaults to 0",
    "name": "minValue",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The maximum slider value. Defaults to 100",
    "name": "maxValue",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The stepping interval. Defaults to 1",
    "name": "step",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum permitted steps between thumbs. Defaults to 0",
    "name": "minStepsBetweenThumbs",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "(params: GetValueLabelParams) => string",
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "name": "getValueLabel",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the slider.",
    "name": "orientation",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the slider, used when submitting an HTML form.",
    "name": "name",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the slider should display its \"valid\" or \"invalid\" visual styling.",
    "name": "validationState",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must check a radio group item before the owning form can be submitted.",
    "name": "required",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled.",
    "name": "disabled",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group items can be selected but not changed by the user.",
    "name": "readOnly",
    "hashName": "slider-1",
    "kobalte": true
  }
];