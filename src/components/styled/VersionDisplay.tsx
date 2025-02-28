import { APP_NAME, APP_VERSION } from "~/pages/settings/constants";

export function VersionDisplay() {
  return (
    <div class="color:secondary f:12 opacity:0.8">
      {APP_NAME} v{APP_VERSION}
    </div>
  );
}
