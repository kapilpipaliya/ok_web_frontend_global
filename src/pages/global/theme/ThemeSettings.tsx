import { SelectThemeMenu } from "~/pages/theme_menu/SelectThemeMenu";

export function ThemeSettings() {
  return (
    <div class="flex flex:col gap:1rem">
      <div class="flex flex:col gap:0.5rem">
        <h2 class="text:1.2rem font:medium">Theme Management</h2>
        <p class="fg:neutral-60">Customize the look and feel of your application by managing themes.</p>
      </div>
      <div class="bg:base-1 r:md p:1rem">
        <SelectThemeMenu isStandalone={true} />
      </div>
    </div>
  );
} 