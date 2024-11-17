export const CONSTANTS = {
  inputBorderRadius: "r:6",
  inputFieldBorder: "border:1px|solid|#ccc",
  fullWidth: "w:100%",
  inputFieldPadding: "p:2",
};

export const PROPERTIES = {
  Css: {
    CheckBox: `${CONSTANTS.inputFieldBorder} ${CONSTANTS.inputFieldPadding} ${CONSTANTS.inputBorderRadius}`,
    RadioButton: `${CONSTANTS.inputFieldBorder} ${CONSTANTS.inputFieldPadding} ${CONSTANTS.inputBorderRadius}`,
    TextField: `${CONSTANTS.inputFieldBorder} ${CONSTANTS.fullWidth} ${CONSTANTS.inputFieldPadding} ${CONSTANTS.inputBorderRadius}`,
  },
};
