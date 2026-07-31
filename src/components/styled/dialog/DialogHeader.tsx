import { As } from "~/components/As";

export function DialogHeader(props: Readonly<{ title: string }>) {
  return (
    <As
      as="h3"
      css={`return \`._id {
  color: \${t.var.color.primary};
  font-size: 1rem;
  font-weight: bold;
}\`;`}
    >
      {props.title}
    </As>
  );
}
