import { As } from "~/components/As";

export function Divider() {
  return (
    <As
      as="div"
      css={`return \`._id {
      height: 1px;
      background-color: \${t.var.color.border};
      margin: 8px 0;
    }\`;`}
    />
  );
}
