import type { JSX } from "solid-js";
import { For } from "solid-js";

import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { useGraph } from "~/lib/graph/context/UseGraph";

export interface AuthenticatedMenuProps {
  onClose: () => void;
}

export function AuthenticatedMenu(
  props: Readonly<AuthenticatedMenuProps>,
): JSX.Element {
  const [graph, _setGraph] = useGraph();
  const _navigate = useNavigate();
  const { showLoadingToast } = useToast();

  const isSystemSubDomain = () =>
    getMemberVertex(graph).P.subDomain === "admin";

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
    <As
      as="div"
      css={css`
  padding: 10px;
`}
    >
      <For each={getMenuItems()}>
        {(item) => (
          <As
            as="li"
            css={css`
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`}
          >
            <As
              as="a"
              css={(args) => css`
  display: flex;
  align-items: center;
  color: ${args.theme.var.color.base};
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  &:hover {
    background-color: ${args.theme.var.color.primary_30};
  }
`}
              href={item.href}
              onclick={props.onClose}
              target={item.target}
            >
              <As
                as={Icon}
                css={(args) => css`
  margin-right: 10px;
  color: ${args.theme.var.color.primary};
`}
                icon={item.icon}
                width="20"
              />
              {item.label}
            </As>
          </As>
        )}
      </For>
      <As
        as="hr"
        css={(args) => css`
  margin-top: 8px;
  margin-bottom: 8px;
  color: ${args.theme.var.color.base_40};
`}
      />
      <li>
        <As
          as="a"
          css={(args) => css`
  display: flex;
  align-items: center;
  width: 100%;
  color: ${args.theme.var.color.error};
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: ${args.theme.var.color.error_30};
  }
`}
          href={API.urls.user.logout}
        >
          <As
            as={Icon}
            css={css`
  margin-right: 10px;
`}
            icon="ph:sign-out"
            width="20"
          />
          Sign Out
        </As>
      </li>
    </As>
  );
}
