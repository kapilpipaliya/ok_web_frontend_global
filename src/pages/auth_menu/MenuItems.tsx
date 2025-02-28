import { type JSX, Show } from "solid-js";

import { getMemberVertex } from "~/lib/graph/get/sync/user/getMemberVertex";
import { useGraph } from "~/lib/graph/graph";

import { AuthenticatedMenu } from "./AuthenticatedMenu";
import { UnauthenticatedMenu } from "./UnauthenticatedMenu";

export interface MenuItemsProps {
  onClose: () => void;
}

export function MenuItems(props: Readonly<MenuItemsProps>): JSX.Element {
  const [graph] = useGraph();
  const isAuthenticated = () => {
    const member = getMemberVertex(graph);
    return !!member?.P?.email;
  };

  return (
    <Show
      fallback={<UnauthenticatedMenu onClose={props.onClose} />}
      when={isAuthenticated()}
    >
      <AuthenticatedMenu onClose={props.onClose} />
    </Show>
  );
}
