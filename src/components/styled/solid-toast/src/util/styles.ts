import type { JSX } from "solid-js";

export const toastBarBase: JSX.CSSProperties = {
  "align-items": "center",
  background: "white",
  "border-radius": "4px",
  "box-shadow": "0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05)",
  color: "#363636",
  display: "flex",
  "line-height": "1.3",
  "max-width": "350px",
  padding: "8px 10px",
  "pointer-events": "auto",
  "will-change": "transform",
};

export const messageContainer: JSX.CSSProperties = {
  "align-items": "center",
  display: "flex",
  flex: "1 1 auto",
  margin: "4px 10px",
  "white-space": "pre-line",
};

export const iconContainer: JSX.CSSProperties = {
  "align-items": "center",
  display: "flex",
  "flex-shrink": 0,
  "justify-content": "center",
  "min-height": "20px",
  "min-width": "20px",
  "text-align": "center",
};

export const genSVGCubicBezier: (
  keySplines: string,
) => Pick<
  JSX.AnimateSVGAttributes<SVGAnimateElement>,
  "calcMode" | "keySplines" | "keyTimes"
> = (keySplines) => ({
  calcMode: "spline",
  keySplines: keySplines,
  keyTimes: "0; 1",
});
