import { createSelectOptions } from "./createSelectOptions";

export const PositionSection = {
  position: createSelectOptions("position", "Position", [
    "static",
    "relative",
    "absolute",
    "fixed",
    "sticky",
  ])
};
