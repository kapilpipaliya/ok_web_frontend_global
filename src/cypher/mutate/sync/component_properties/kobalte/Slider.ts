export const Slider = [
  {
    "componentName": "number[]",
    "description": "The controlled values of the slider. Must be used in conjunction with onChange.",
    "key": "value",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number[]",
    "description": "The value of the slider when initially rendered. Use when you do not need to control the state of the slider.",
    "key": "defaultValue",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "(value: number[]) => void",
    "description": "Event handler called when the value changes.",
    "key": "onChange",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "(value: number[]) => void",
    "description": "Event handler called when the value changes at the end of an interaction.",
    "key": "onChangeEnd",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the slider is visually inverted. Defaults to false.",
    "key": "inverted",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum slider value. Defaults to 0",
    "key": "minValue",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The maximum slider value. Defaults to 100",
    "key": "maxValue",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The stepping interval. Defaults to 1",
    "key": "step",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum permitted steps between thumbs. Defaults to 0",
    "key": "minStepsBetweenThumbs",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "(params: GetValueLabelParams) => string",
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "key": "getValueLabel",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the slider.",
    "key": "orientation",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the slider, used when submitting an HTML form.",
    "key": "name",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the slider should display its \"valid\" or \"invalid\" visual styling.",
    "key": "validationState",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must check a radio group item before the owning form can be submitted.",
    "key": "required",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled.",
    "key": "disabled",
    "hashName": "slider-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group items can be selected but not changed by the user.",
    "key": "readOnly",
    "hashName": "slider-1",
    "kobalte": true
  }
];