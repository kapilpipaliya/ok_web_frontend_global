import { Title } from "@solidjs/meta";

export function SiteTitle(props: { children: string }) {
  return <Title>{`${props.children.trim()} | EasyFormForge`}</Title>;
}
