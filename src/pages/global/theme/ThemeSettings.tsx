import { lazy, Suspense } from "solid-js";
import { As } from "~/components/As";

const SelectThemeMenu = lazy(() =>
  import("~/pages/theme_menu/SelectThemeMenu").then((m) => ({
    default: m.SelectThemeMenu,
  })),
);

export function ThemeSettings() {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}\`;`}
      >
        <As
          as="h2"
          css={`return \`._id {
  white-space: 1.2rem;
  font-size: medium;
}\`;`}
        >
          Theme Management
        </As>
        <As
          as="p"
          css={`return \`._id {
  color: \${t.var.color.text_light_400};
}\`;`}
        >
          Customize the look and feel of your application by managing themes.
        </As>
      </As>
      <As
        as="div"
        css={`return \`._id {
  background-color: \${t.var.color.background_light_100};
  color: \${t.var.color.background_light_100_text};
  border-radius: 6px;
  padding: 1rem;
}\`;`}
      >
        <Suspense fallback={null}>
          <SelectThemeMenu isStandalone={true} />
        </Suspense>
      </As>
    </As>
  );
}
