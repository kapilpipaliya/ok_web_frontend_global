export const Slider = [
  {
    "componentName": "number[]",
    "description": "The controlled values of the slider. Must be used in conjunction with onChange.",
    "hashName": "slider-1",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "number[]",
    "description": "The value of the slider when initially rendered. Use when you do not need to control the state of the slider.",
    "hashName": "slider-1",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: number[]) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "slider-1",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "(value: number[]) => void",
    "description": "Event handler called when the value changes at the end of an interaction.",
    "hashName": "slider-1",
    "key": "onChangeEnd",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the slider is visually inverted. Defaults to false.",
    "hashName": "slider-1",
    "key": "inverted",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum slider value. Defaults to 0",
    "hashName": "slider-1",
    "key": "minValue",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The maximum slider value. Defaults to 100",
    "hashName": "slider-1",
    "key": "maxValue",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The stepping interval. Defaults to 1",
    "hashName": "slider-1",
    "key": "step",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum permitted steps between thumbs. Defaults to 0",
    "hashName": "slider-1",
    "key": "minStepsBetweenThumbs",
    "kobalte": true
  },
  {
    "componentName": "(params: GetValueLabelParams) => string",
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "hashName": "slider-1",
    "key": "getValueLabel",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the slider.",
    "hashName": "slider-1",
    "key": "orientation",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the slider, used when submitting an HTML form.",
    "hashName": "slider-1",
    "key": "name",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the slider should display its \"valid\" or \"invalid\" visual styling.",
    "hashName": "slider-1",
    "key": "validationState",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must check a radio group item before the owning form can be submitted.",
    "hashName": "slider-1",
    "key": "required",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled.",
    "hashName": "slider-1",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group items can be selected but not changed by the user.",
    "hashName": "slider-1",
    "key": "readOnly",
    "kobalte": true
  }
];