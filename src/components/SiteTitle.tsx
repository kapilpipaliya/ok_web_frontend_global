import { Title } from "@solidjs/meta";

// TODO: Should get from the global state
export function SiteTitle(props: Readonly<{ children: string }>) {
  return <Title>{`${props.children.trim()} | EasyFormForge`}</Title>;
}
