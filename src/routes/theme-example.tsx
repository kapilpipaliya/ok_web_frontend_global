import { ThemeExample } from "~/components/styled/ThemeExample";
import { GetInitialData } from "~/GetInitialData";

export default function ThemeExamplePage() {
  return (
    <GetInitialData authenticate={false} dontRedirectToLogin={true}>
      <div
        style={{
          padding: "2rem",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          "min-height": "100vh",
        }}
      >
        <h1 style={{ "margin-bottom": "2rem", "text-align": "center" }}>
          Theme Example
        </h1>
        <ThemeExample />
      </div>
    </GetInitialData>
  );
}
