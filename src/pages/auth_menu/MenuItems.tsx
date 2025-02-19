import { type JSX, Show } from "solid-js";

import { getMemberVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { useGraph } from "~/lib/graph/graph";

import { AuthenticatedMenu } from "./AuthenticatedMenu";
import { UnauthenticatedMenu } from "./UnauthenticatedMenu";
export interface MenuItemsProps {
  onClose: () => void;
  signOutCall: () => Promise<{
    [key: string]: any;
  }>;
}

export function MenuItems(props: Readonly<MenuItemsProps>): JSX.Element {
  const [graph] = useGraph();
  return (
    <Show
      fallback={<UnauthenticatedMenu onClose={props.onClose} />}
      when={!!getMemberVertex(graph)?.P?.email}
    >
      <AuthenticatedMenu onClose={props.onClose} />
    </Show>
  );
}
