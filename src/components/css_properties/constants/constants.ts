import { VALUE_UNITS } from "@master/css";
const sizeTypes_ = ["rem", "em", "px", "%", "vw", "vh"];

export const sizeTypes = [...sizeTypes_, ...VALUE_UNITS.filter((size: string) => !sizeTypes_.includes(size))];
export const timesTypes = ["s", "ms"];