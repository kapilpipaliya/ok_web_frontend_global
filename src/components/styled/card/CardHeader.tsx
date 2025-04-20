import { type JSX, Show } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

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
          css={css`
  background-color: rgb(255,255,255);
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
  display: flex;
  height: 3rem;
  object-fit: cover;
  width: 3rem;
`}
          src={props.imgSrc}
        />
      </Show>
      <As
        as="div"
        css={css`
  color: rgb(17,24,39);
  font-size: 0.875rem;
  font-weight: 500;
`}
      >
        {props.title}
      </As>
      {props.children}
    </>
  );
}
