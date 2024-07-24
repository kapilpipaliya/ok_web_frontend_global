import { Title } from "@solidjs/meta";

export function SiteTitle(props: Readonly<{ children: string }>) {
  return <Title>{`${props.children.trim()} | EasyFormForge`}</Title>;
}
