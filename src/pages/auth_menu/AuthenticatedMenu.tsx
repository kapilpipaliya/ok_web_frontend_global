import type { JSX } from "solid-js";

import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";
import { For } from "solid-js";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { getMemberVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { type GlobalProperties, useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { URLS } from "../constants/URLS";

export interface AuthenticatedMenuProps {
  onClose: () => void;
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

  const getMenuItems = () => {
    const commonItems = [
      // { href: URLS.ADMIN.CONTACT, icon: "ph:question", label: "Help" },
    ] as { href: string; icon: string; label: string }[];

    return isSystemSubDomain()
      ? [
          {
            href: URLS.SYSTEM.PROJECTS,
            icon: "ph:umbrella",
            label: "Projects",
          },
          {
            href: URLS.SYSTEM.GLOBAL_SETTINGS,
            icon: "ph:gear",
            label: "Global Settings",
          },
          {
            href: URLS.SYSTEM.USER_SETTINGS,
            icon: "ph:user-gear",
            label: "User Settings",
          },
          ...commonItems,
        ]
      : [
          {
            href: URLS.ADMIN.GLOBAL_SETTINGS,
            icon: "ph:gear",
            label: "Global Settings",
          },
          {
            href: URLS.ADMIN.USER_SETTINGS,
            icon: "ph:user-gear",
            label: "User Settings",
          },
          ...commonItems,
        ];
  };

  const handleLogout = async () => {
    props.onClose();
    mergeVertexProperties<GlobalProperties>(0, globalStoreId, graph, setGraph, {
      isLoadingPage: true,
    });

    await showLoadingToast({
      loadMessage: "Logging Out...",
      onSuccess: (value) => {
        if (value?.message != null) {
          navigate(URLS.ADMIN.LOGIN);
        }
      },
      promise: postAPI(API.auth.logOutUrl, {}),
      successMessage: "Log Out Successfully",
    });

    mergeVertexProperties<GlobalProperties>(0, globalStoreId, graph, setGraph, {
      isLoadingPage: false,
    });
  };

  return (
    <div class="p:10px">
      <For each={getMenuItems()}>
        {(item) => (
          <li class="mb:8px last:mb:0">
            <a
              class="
                flex ai:center 
                bg:primary-20:hover 
                fg:base-80
                p:8px|12px 
                r:6px 
                text-decoration:none
              "
              href={item.href}
              onclick={props.onClose}
            >
              <Icon
                class="mr:10px color:primary-60"
                icon={item.icon}
                width="20"
              />
              {item.label}
            </a>
          </li>
        )}
      </For>
      <hr class="my:8px color:base-20" />
      <li>
        <button
          class="
            flex ai:center w:100%
            bg:error-10:hover
            fg:error-70
            p:8px|12px
            r:6px
            text-decoration:none
            border:none
            cursor:pointer
          "
          onclick={handleLogout}
        >
          <Icon class="mr:10px" icon="ph:sign-out" width="20" />
          Sign Out
        </button>
      </li>
    </div>
  );
}
