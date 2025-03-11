import type { JSX } from "solid-js";

import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@tanstack/solid-router";
import { For } from "solid-js";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { getMemberVertex } from "~/lib/graph/get/sync/user/getMemberVertex";
import { useGraph } from "~/lib/graph/graph";

export interface AuthenticatedMenuProps {
  onClose: () => void;
}

export function AuthenticatedMenu(
  props: Readonly<AuthenticatedMenuProps>,
): JSX.Element {
  const [graph, setGraph] = useGraph();

  const isSystemSubDomain = () =>
    getMemberVertex(graph).P.subDomain === "super";

  const getMenuItems = () => {
    const commonItems = [
      // { href: API.urls.admin.contact, icon: "ph:question", label: "Help" },
    ] as { href: string; icon: string; label: string; target?: string }[];

    if (!(isSystemSubDomain() || isAdminRole(graph))) {
      commonItems.push({
        href: API.urls.admin.support,
        icon: "ph:question",
        label: "Support",
        target: "_blank",
      });
    } else if (isSystemSubDomain()) {
      commonItems.push({
        href: `${window.location.origin.replace(`${getMemberVertex(graph).P.subDomain}.`, "")}/support/contact`,
        icon: "ph:question",
        label: "Support",
        target: "_blank",
      });
    }

    return isSystemSubDomain()
      ? [
          {
            href: API.urls.system.projects,
            icon: "ph:umbrella",
            label: "Projects",
          },
          {
            href: API.urls.system.globalSettings,
            icon: "ph:gear",
            label: "Global Settings",
          },
          {
            href: API.urls.system.userSettings,
            icon: "ph:user-gear",
            label: "User Settings",
          },
          ...commonItems,
        ]
      : [
          {
            href: API.urls.admin.globalSettings,
            icon: "ph:gear",
            label: "Global Settings",
          },
          {
            href: API.urls.admin.userSettings,
            icon: "ph:user-gear",
            label: "User Settings",
          },
          ...commonItems,
        ];
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
              target={item.target}
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
        <a
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
          href={API.urls.user.logout}
        >
          <Icon class="mr:10px" icon="ph:sign-out" width="20" />
          Sign Out
        </a>
      </li>
    </div>
  );
}
