import { createSignal, For, Show } from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import { useGraph } from "~/lib/graph/graph";
import { profileImage } from "~/pages/admin_layout/constant";
import { UserDropdownMenuDisplay } from "~/pages/admin_layout/DropdownMenuDisplay";
import { TemplateGraphProvider } from "~/pages/TemplateGraphProvider";
import { SchemaRenderer } from "~/routes/admin/SchemaRenderer";

export default function Settings() {
  return (
    <TemplateGraphProvider>
      <SettingsContent />
    </TemplateGraphProvider>
  );
}

function EmailSettings() {
  return <div>EmailSettings</div>;
}
function PasswordSettings() {
  return <div>PasswordSettings</div>;
}
function ProfileSettings() {
  const GRID_ITEM_CLASS =
    "grid grid-template-columns:150px|500px ai:center gap:8";
  const LABEL_CLASS = "color:dimgrey font-weight:500 font:15";

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: LABEL_CLASS,
            componentName: "Text",
            text: "Profile Image",
          },
          {
            as: "img",
            class: "cursor:pointer h:60px object-fit:cover w:60px",
            componentName: "Box",
            key: "profileImage",
            src: profileImage,
          },
        ],
        class: GRID_ITEM_CLASS,
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: LABEL_CLASS,
            componentName: "Text",
            text: "Username",
            validation: { required: true },
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "username",
            placeholder: "Username",
            validation: { required: true },
          },
        ],
        class: GRID_ITEM_CLASS,
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: LABEL_CLASS,
            componentName: "Text",
            key: "emailLabel",
            text: "Email Address",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "email",
            placeholder: "Email Address",
            validation: { required: true },
          },
        ],
        class: GRID_ITEM_CLASS,
        componentName: "Box",
      },
      // {
      //   as: "div",
      //   attributes: [
      //     {
      //       as: "span",
      //       class: LABEL_CLASS,
      //       componentName: "Box",
      //       text: "Country"
      //     },
      //     {
      //       class: "border:1px|solid|#ccc p:5|10 r:4",
      //       componentName: "Select",
      //       key: "country",
      //       options: [
      //         { text: "United States", value: "United States" },
      //         { text: "Canada", value: "Canada" },
      //         { text: "United Kingdom", value: "United Kingdom" },
      //       ],
      //     },
      //   ],
      //   class: GRID_ITEM_CLASS,
      //   componentName: "Box",
      // },
      {
        as: "div",
        attributes: [
          {
            as: "button",
            class:
              "bg:primary fg:white p:8|16 r:4 cursor:pointer border:none mr:8",
            componentName: "Box",
            props: () => ({
              onClick: () => {},
            }),
            text: "Save Changes",
          },
          {
            as: "button",
            class:
              "bg:#f3f4f6 fg:#374151 p:8|16 r:4 cursor:pointer border:1px|solid|#e5e7eb",
            componentName: "Box",
            text: "Cancel",
          },
        ],
        class: "mt:24 flex",
        componentName: "Box",
      },
    ],
    class: "p:10 grid gap:10",
    componentName: "Box",
  } as FieldAttribute;
  return (
    <div>
      <SchemaRenderer form={{ attributes: [form], key: "Profile" }} />
    </div>
  );
}

function SettingsContent() {
  const [graph] = useGraph();
  const [selectedMenu, setSelectedMenu] = createSignal("profile");

  const isAdmin = () => getGlobalStore(graph).P.userRoles.includes("admin");

  const menuItems = [
    {
      component: "ProfileSettings",
      id: "profile",
      label: "Profile",
    },
    {
      component: "PasswordSettings",
      id: "password",
      label: "Change Password",
    },
    {
      adminOnly: true,
      component: "EmailSettings",
      id: "email",
      label: "Email Settings",
    },
  ];

  return (
    <div class="display:grid grid-template-rows:auto|1fr h:100vh">
      <div class="display:flex">
        <HeaderWithDescription
          class="flex:1"
          description="Manage your account settings and preferences."
          title="Account Settings"
        />
        <div class="ml:auto flex gap:4">
          <UserDropdownMenuDisplay />
        </div>
      </div>

      <div class="display:grid grid-template-columns:250px|1fr border-right:1px|solid|#eee p:6">
        <div>
          <For each={menuItems}>
            {(item) => (
              <Show when={!item.adminOnly || isAdmin()}>
                <div
                  class={`p:12px cursor:pointer r:4px mb:8px ${
                    selectedMenu() === item.id
                      ? "bg:secondary fg:white"
                      : "bg:#f3f4f6:hover fg:#374151"
                  }`}
                  onClick={() => setSelectedMenu(item.id)}
                >
                  {item.label}
                </div>
              </Show>
            )}
          </For>
        </div>
        <div class="flex:1 p:6">
          <Show when={selectedMenu() === "profile"}>
            <ProfileSettings />
          </Show>
          <Show when={selectedMenu() === "password"}>
            <PasswordSettings />
          </Show>
          <Show when={selectedMenu() === "email"}>
            <EmailSettings />
          </Show>
        </div>
      </div>
    </div>
  );
}
