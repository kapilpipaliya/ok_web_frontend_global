export const Slider = [
  {
    "description": "The controlled values of the slider. Must be used in conjunction with onChange.",
    "property": "value",
    "type": "number[]"
  },
  {
    "description": "The value of the slider when initially rendered. Use when you do not need to control the state of the slider.",
    "property": "defaultValue",
    "type": "number[]"
  },
  {
    "description": "Event handler called when the value changes.",
    "property": "onChange",
    "type": "(value: number[]) => void"
  },
  {
    "description": "Event handler called when the value changes at the end of an interaction.",
    "property": "onChangeEnd",
    "type": "(value: number[]) => void"
  },
  {
    "description": "Whether the slider is visually inverted. Defaults to false.",
    "property": "inverted",
    "type": "boolean"
  },
  {
    "description": "The minimum slider value. Defaults to 0",
    "property": "minValue",
    "type": "number"
  },
  {
    "description": "The maximum slider value. Defaults to 100",
    "property": "maxValue",
    "type": "number"
  },
  {
    "description": "The stepping interval. Defaults to 1",
    "property": "step",
    "type": "number"
  },
  {
    "description": "The minimum permitted steps between thumbs. Defaults to 0",
    "property": "minStepsBetweenThumbs",
    "type": "number"
  },
  {
    "description": "A function to get the accessible label text representing the current value in a human-readable format. If not provided, the value label will be read as a percentage of the max value.",
    "property": "getValueLabel",
    "type": "(params: GetValueLabelParams) => string"
  },
  {
    "description": "The orientation of the slider.",
    "property": "orientation",
    "type": "'horizontal' | 'vertical'"
  },
  {
    "description": "The name of the slider, used when submitting an HTML form.",
    "property": "name",
    "type": "string"
  },
  {
    "description": "Whether the slider should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState",
    "type": "'valid' | 'invalid'"
  },
  {
    "description": "Whether the user must check a radio group item before the owning form can be submitted.",
    "property": "required",
    "type": "boolean"
  },
  {
    "description": "Whether the radio group is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the radio group items can be selected but not changed by the user.",
    "property": "readOnly",
    "type": "boolean"
  }
];