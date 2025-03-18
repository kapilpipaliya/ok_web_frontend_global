export interface TextShadowAttributes {
  "blur-radius": string;
  color: string;
  "offset-x": string;
  "offset-y": string;
}

export function generateTextShadow(
  shadows: TextShadowAttributes[],
  isView?: boolean,
): string {
  if (!shadows) {
    return "";
  }
  const separator = isView ? " " : "|";
  const separator2 = isView ? ", " : ",";

  return shadows
    .filter((shadow) => shadow)
    .map((shadow) => {
      const {
        "blur-radius": blurRadius = "0px",
        color = "",
        "offset-x": offsetX = "0px",
        "offset-y": offsetY = "0px",
      } = shadow;

      const colorPart = color ? `${separator}${color}` : "";

      return `${offsetX}${separator}${offsetY}${separator}${blurRadius}${colorPart}`;
    })
    .join(separator2);
}
