import { Show } from "solid-js";
import { useIsRouting } from "@solidjs/router";
import { Style2 } from "~/components/StyleRenderer";

/** Thin top progress bar while Solid Router is transitioning between routes. */
export function NavigationProgressBar() {
  const isRouting = useIsRouting();

  return (
    <Show when={isRouting()}>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          height: "2px",
          "z-index": "100000",
          "pointer-events": "none",
          overflow: "hidden",
          background: "transparent",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "40%",
            background: "#3b82f6",
            animation: "ok-nav-progress 1s ease-in-out infinite",
          }}
        />
        <Style2
          cssContent={`
            @keyframes ok-nav-progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(350%); }
            }
          `}
        />
      </div>
    </Show>
  );
}
