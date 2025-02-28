import { SelectThemeMenu } from "~/pages/theme_menu/SelectThemeMenu";

export function ThemeSettings() {
  return (
    <div class="flex flex:col gap:1rem">
      <div class="flex flex:col gap:0.5rem">
        <h2 class="text:1.2rem font:medium">Theme Management</h2>
        <p class="fg:neutral-60">
          Customize the look and feel of your application by managing themes.
        </p>
        <p class="fg:neutral-60">
          We are using the master CSS engine to compile class names to CSS. You
          can customize the theme of the master CSS by specifying variables in
          the config file. For more information, visit:
          <a
            class="text:primary"
            href="https://rc.css.master.co/guide/variables"
            rel="noreferrer"
            target="_blank"
          >
            {" "}
            this guide
          </a>
          .
        </p>
      </div>
      <div class="bg:base-1 r:md p:1rem">
        <SelectThemeMenu isStandalone={true} />
      </div>
    </div>
  );
}
