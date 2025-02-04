import type { JSX } from "solid-js";

import { useNavigate } from "@solidjs/router";

import { useToast } from "~/components/styled/Toast";
import { GlobalProperties, useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export interface AuthenticatedMenuProps {
  onClose: () => void;
  signOutCall: () => Promise<{
    [key: string]: any;
  }>;
}

export function AuthenticatedMenu(
  props: Readonly<AuthenticatedMenuProps>,
): JSX.Element {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();
  const { showLoadingToast } = useToast();
  const globalStoreId = "globalStoreId";

  return (
    <>
      <li class="m:5|10 mt:5px">
        <a
          class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none"
          href={`/admin/settings`}
          onclick={props.onClose}
        >
          Account Setting
        </a>
      </li>
      <li class="m:5|10 mt:5px">
        <a
          class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none"
          href="/contact-us"
          onclick={props.onClose}
        >
          Help
        </a>
      </li>
      <hr class="color:rgb(223,223,223)" />
      <li class="m:5|10 mt:5px">
        <a
            class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none cursor:pointer"
          onclick={async () => {
            props.onClose();
            mergeVertexProperties<GlobalProperties>(0, globalStoreId, graph, setGraph, { isLoadingPage: true });
            await showLoadingToast({
              loadMessage: "Logging Out...",
              onSuccess: (value) => {
                if (value != null && value.message !== null) {
                  navigate("/auth/login");
                }
              },
              promise: props.signOutCall(),
              successMessage: "Log Out Successfully",
            });
            mergeVertexProperties<GlobalProperties>(0, globalStoreId, graph, setGraph, { isLoadingPage: false });
          }}
        >
          Sign Out
        </a>
      </li>
    </>
  );
}
