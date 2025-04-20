import type { JSX } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

interface UnauthenticatedMenuProps {
  onClose: () => void;
}

export function UnauthenticatedMenu(
  props: Readonly<UnauthenticatedMenuProps>,
): JSX.Element {
  return (
    <>
      <As
        as="li"
        css={css`
  margin: 5px 10px;
  margin-top: 5px;
`}
      >
        <As
          as="a"
          css={css`
  display: flex;
  align-items: center;
  color: #333;
  padding: 5px 7px;
  border-radius: 5px;
  text-decoration: none;
  &:hover {
    background-color: rgb(241,241,241);
  }
`}
          href="/auth/login"
          onclick={props.onClose}
          replace={true}
        >
          Log In
        </As>
      </As>
      <As
        as="li"
        css={css`
  margin: 5px 10px;
  margin-top: 5px;
`}
      >
        <As
          as="a"
          css={css`
  display: flex;
  align-items: center;
  color: #333;
  padding: 5px 7px;
  border-radius: 5px;
  text-decoration: none;
  &:hover {
    background-color: rgb(241,241,241);
  }
`}
          href="/auth/signup"
          onclick={props.onClose}
          replace={true}
        >
          Sign Up
        </As>
      </As>
    </>
  );
}
