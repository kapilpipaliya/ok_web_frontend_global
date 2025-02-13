import { Title } from "@solidjs/meta";
import { APP_NAME, APP_VERSION } from "~/constants/version";

// TODO: Should get from the global state
export function SiteTitle(props: Readonly<{ children: string }>) {
  return <Title>{`${props.children.trim()} | ${APP_NAME} v${APP_VERSION}`}</Title>;
}
