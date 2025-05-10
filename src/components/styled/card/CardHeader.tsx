import { type JSX, Show } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

export function CardHeader(props: {
  children?: JSX.Element;
  imgSrc?: string;
  title?: string;
}) {
  return (
    <>
      <Show when={props.imgSrc}>
        <As
          as="img"
          alt={props.title}
          css={(args: FunctionArgumentType) => css`
  background-color: ${args.theme.var.color.base_5};
  border-radius: 0.5rem;
  border-width: 1px;
  border-color: ${args.theme.var.color.primary_25};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  height: 3rem;
  object-fit: cover;
  width: 3rem;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`}
          src={props.imgSrc}
        />
      </Show>
      <As
        as="div"
        css={(args: FunctionArgumentType) => css`
  color: ${args.theme.var.color.base_85};
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
`}
      >
        {props.title}
      </As>
      {props.children}
    </>
  );
}
