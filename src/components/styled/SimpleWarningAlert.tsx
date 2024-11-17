import type { JSX } from "solid-js";

interface WithAccentBorderProps {
  backgroundColor?: string;
  borderColor?: string;
  iconColor?: string;
  linkHoverColor?: string;
  linkHref?: string;
  linkText?: string;
  message?: string;
  padding?: string;
}

export function SimpleWarningAlert(
  props: Readonly<WithAccentBorderProps>,
): JSX.Element {
  return (
    <div
      style={{
        "background-color": props.backgroundColor || "rgb(255,251,235)",
        "border-color": props.borderColor || "rgb(251,191,36)",
        "border-left-width": "4px",
        padding: props.padding || "1rem",
      }}
    >
      <div class="flex">
        <div class="flex-shrink:0">
          <svg
            aria-hidden="true"
            class="h:1.25rem w:1.25rem"
            fill="currentColor"
            style={{ color: props.iconColor || "rgb(251,191,36)" }}
            viewBox="0 0 20 20"
          >
            <path
              clip-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              fill-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml:0.75rem">
          <p class="lh:1.25rem f:0.875rem" style={{ color: "rgb(180,83,9)" }}>
            {props.message || "Warning"}
            <a
              class={
                "color:rgb(180,83,9) font-weight:500 text-decoration:underline"
              }
              classList={{
                [`color:${props.linkHoverColor ?? "rgb(217,119,6)"}:hover`]:
                  !props.linkHoverColor,
              }}
              href={props.linkHref || "#"}
            >
              {props.linkText || ""}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
