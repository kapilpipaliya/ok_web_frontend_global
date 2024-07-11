import { createSelectOptions } from "./FieldType";

export const PositionSection = {
  position: createSelectOptions("position", "Position", [
    "static",
    "relative",
    "absolute",
    "fixed",
    "sticky",
  ]),
};
