import type { JSX } from "solid-js";

import { useNavigate } from "@solidjs/router";
import { For } from "solid-js";

import { useToast } from "~/components/styled/Toast";
import { getMemberVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { type GlobalProperties, useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { URLS } from "../constants/URLS";

export interface AuthenticatedMenuProps {
  onClose: () => void;
  signOutCall: () => Promise<Record<string, unknown>>;
}

export function AuthenticatedMenu(
  props: Readonly<AuthenticatedMenuProps>,
): JSX.Element {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();
  const { showLoadingToast } = useToast();
  const globalStoreId = "globalStoreId";

  const isSystemSubDomain = () =>
    getMemberVertex(graph).P.subDomain === "super";

  const menuItems = () =>
    isSystemSubDomain()
      ? [{ href: URLS.SYSTEM.PROJECTS, label: "Projects" }]
      : [
          { href: URLS.ADMIN.GLOBAL_SETTINGS, label: "Global Settings" },
          { href: URLS.ADMIN.USER_SETTINGS, label: "User Settings" },
          { href: URLS.ADMIN.CONTACT, label: "Help" },
        ];

  return (
    <>
      <For each={menuItems()}>
        {(item) => (
          <li class="m:5|10 mt:5px">
            <a
              class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none"
              href={item.href}
              onclick={props.onClose}
            >
              {item.label}
            </a>
          </li>
        )}
      </For>
      <hr class="color:rgb(223,223,223)" />
      <li class="m:5|10 mt:5px">
        <a
          class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none cursor:pointer"
          onclick={async () => {
            props.onClose();
            mergeVertexProperties<GlobalProperties>(
              0,
              globalStoreId,
              graph,
              setGraph,
              { isLoadingPage: true },
            );
            await showLoadingToast({
              loadMessage: "Logging Out...",
              onSuccess: (value) => {
                if (value != null && value.message !== null) {
                  navigate(URLS.ADMIN.LOGIN);
                }
              },
              promise: props.signOutCall(),
              successMessage: "Log Out Successfully",
            });
            mergeVertexProperties<GlobalProperties>(
              0,
              globalStoreId,
              graph,
              setGraph,
              { isLoadingPage: false },
            );
          }}
        >
          Sign Out
        </a>
      </li>
    </>
  );
}
