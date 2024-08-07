import { type JSX, Show } from "solid-js";

import { useGraph } from "~/lib/graph/graph";

import { AuthenticatedMenu } from "./AuthenticatedMenu";
import { UnauthenticatedMenu } from "./UnauthenticatedMenu";
export interface MenuItemsProps {
  onClose: () => void;
  signOutCall: () => Promise<void>;
}

export function MenuItems(props: Readonly<MenuItemsProps>): JSX.Element {
  const [graph] = useGraph();
  return (
    <Show
      fallback={<UnauthenticatedMenu onClose={props.onClose} />}
      when={!!graph.member?.P?.email}
    >
      <AuthenticatedMenu
        onClose={props.onClose}
        signOutCall={props.signOutCall}
      />
    </Show>
  );
}
