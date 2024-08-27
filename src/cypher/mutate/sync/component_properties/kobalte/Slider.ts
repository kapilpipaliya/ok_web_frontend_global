export const Slider = [
  {
    "componentName": "number[]",
    "description": "The controlled values of the slider. Must be used in conjunction with onChange.",
    "property": "value"
  },
  {
    "componentName": "number[]",
    "description": "The value of the slider when initially rendered. Use when you do not need to control the state of the slider.",
    "property": "defaultValue"
  },
  {
    "componentName": "(value: number[]) => void",
    "description": "Event handler called when the value changes.",
    "property": "onChange"
  },
  {
    "componentName": "(value: number[]) => void",
    "description": "Event handler called when the value changes at the end of an interaction.",
    "property": "onChangeEnd"
  },
  {
    "componentName": "boolean",
    "description": "Whether the slider is visually inverted. Defaults to false.",
    "property": "inverted"
  },
  {
    "componentName": "number",
    "description": "The minimum slider value. Defaults to 0",
    "property": "minValue"
  },
  {
    "componentName": "number",
    "description": "The maximum slider value. Defaults to 100",
    "property": "maxValue"
  },
  {
    "componentName": "number",
    "description": "The stepping interval. Defaults to 1",
    "property": "step"
  },
  {
    "componentName": "number",
    "description": "The minimum permitted steps between thumbs. Defaults to 0",
    "property": "minStepsBetweenThumbs"
  },
  {
    "componentName": "(params: GetValueLabelParams) => string",
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "property": "getValueLabel"
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the slider.",
    "property": "orientation"
  },
  {
    "componentName": "string",
    "description": "The name of the slider, used when submitting an HTML form.",
    "property": "name"
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the slider should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState"
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must check a radio group item before the owning form can be submitted.",
    "property": "required"
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group items can be selected but not changed by the user.",
    "property": "readOnly"
  }
];