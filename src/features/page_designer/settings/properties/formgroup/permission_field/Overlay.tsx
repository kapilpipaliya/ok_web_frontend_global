import { As } from "~/components/As";

export function Overlay() {
  return (
    <As
      as="div"
      css={`return \`._id {
          background-color: \${t.var.color.background};
          opacity: 0.8;
          inset: 0;
          position: fixed;
      }\`;`}
    />
  );
}
