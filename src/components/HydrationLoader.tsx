import { Show } from "solid-js";

interface HydrationLoaderProps {
  show: boolean;
}

/**
 * Full-screen blur while JS hydrates. Prefer not to SSR this as visible —
 * parent should delay `show` until hydration is actually slow (~250ms).
 */
export const HydrationLoader = (props: HydrationLoaderProps) => {
  return (
    <Show when={props.show}>
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          background: "rgba(255, 255, 255, 0.7)",
          "z-index": "9999",
          "backdrop-filter": "blur(2px)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #f3f4f6",
            "border-top-color": "#3b82f6",
            "border-radius": "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Show>
  );
};
