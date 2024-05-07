import { Title } from "@solidjs/meta";

export default function SiteTitle(props: { children: string }) {
  const titleText = `${props.children.trim()} | EasyFormForge`;
  return <Title>{titleText}</Title>;
}
