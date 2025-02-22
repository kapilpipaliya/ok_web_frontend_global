export const CONSTANTS = {
  fullWidth: "w:100%",
  inputBorderRadius: "r:6",
  inputFieldBorder: "border:1px|solid|base",
  inputFieldPadding: "p:7", // use p:7 to make select and text input same height
};

export const PROPERTIES = {
  Css: {
    CheckBox: `${CONSTANTS.inputFieldBorder} ${CONSTANTS.inputFieldPadding} ${CONSTANTS.inputBorderRadius}`,
    RadioButton: `${CONSTANTS.inputFieldBorder} ${CONSTANTS.inputFieldPadding} ${CONSTANTS.inputBorderRadius}`,
    TextField: `${CONSTANTS.inputFieldBorder} ${CONSTANTS.fullWidth} ${CONSTANTS.inputFieldPadding} ${CONSTANTS.inputBorderRadius}`,
  },
};
