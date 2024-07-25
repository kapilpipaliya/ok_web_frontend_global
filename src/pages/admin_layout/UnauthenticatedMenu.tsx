import { A } from "@solidjs/router";
import { type JSX } from "solid-js";
interface UnauthenticatedMenuProps {
  onClose: () => void;
}


export function UnauthenticatedMenu(props: Readonly<UnauthenticatedMenuProps>): JSX.Element {
  return (
    <>
      <li class="m:5|10 mt:5px">
        <A class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none" href="/auth/login" onclick={props.onClose} replace={true}>
          Log In
        </A>
      </li>
      <li class="m:5|10 mt:5px">
        <A class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none" href="/auth/signup" onclick={props.onClose} replace={true}>
          Sign Up
        </A>
      </li>
    </>
  );
}
