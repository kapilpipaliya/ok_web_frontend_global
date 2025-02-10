import { createSignal, For, Show } from "solid-js";
import { v7 as uuidv7 } from "uuid";
import { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";
import { useGraph } from "~/lib/graph/graph";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { IFormMetaData } from "~/lib/meta/FormMetadataType";
import { UserDropdownMenuDisplay } from "~/pages/admin_layout/DropdownMenuDisplay";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { TemplateGraphProvider } from "~/pages/TemplateGraphProvider";

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
  const [graph, setGraph] = useGraph();
  const metaTxnId = generateNewTxnId(graph, setGraph);
  const form = {
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "img",
            class: "cursor:pointer h:60px object-fit:cover r:50% w:60px",
            componentName: "Box",
            key: "profileImage",
            src: "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png",
          }
        ],
        class: "flex m:10|0 mt:2rem",
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: "color:dimgrey font-weight:500 font:15",
            componentName: "Text", 
            key: "username",
            text: "Username",
            validation: { required: true }
          },
          {
            componentName: "TextInput",
            key: "username",
            placeholder: "Username",
            validation: { required: true }
          }
        ],
        componentName: "Box"
      },
      {
        as: "div",
        attributes: [
          {
            class: "color:dimgrey font-weight:500 font:15", 
            componentName: "Text",
            key: "emailLabel",
            text: "Email Address"
          },
          {
            componentName: "TextInput",
            key: "email",
            placeholder: "Email Address",
            validation: { required: true }
          }
        ],
        componentName: "Box"
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            class: "color:dimgrey font-weight:500 font:15",
            componentName: "Box",
            text: "Country"
          },
          {
            class: "border:1px|solid|#ccc p:5|10 r:4",
            componentName: "Select",
            key: "country",
            options: [
              { text: "United States", value: "United States" },
              { text: "Canada", value: "Canada" },
              { text: "United Kingdom", value: "United Kingdom" }
            ]
          }
        ],
        class: "d:grid",
        componentName: "Box"
      }, {
        as: "div",
        attributes: [
          {
            as: "button",
            class: "bg:primary fg:white p:8|16 r:4 cursor:pointer border:none mr:8",
            componentName: "Box",
            props: (options: FunctionArgumentType) => {
              return {
                onClick: () => {
                  console.log("Save Changes", graph.vertexes[formDataId]);
                }
              }
            },
            text: "Save Changes"
          },
          {
            as: "button", 
            class: "bg:#f3f4f6 fg:#374151 p:8|16 r:4 cursor:pointer border:1px|solid|#e5e7eb",
            componentName: "Box",
            text: "Cancel"
          }
        ],
        class: "mt:24 flex justify-content:flex-end",
        componentName: "Box"
      }
    ],
    class: "grid@>lg gap:10 grid-template-columns:repeat(2,50%) justify-self:center p:10",
    key: "Profile",
  } as IFormMetaData;
  const formMeta = createMeta(form, metaTxnId, graph, setGraph);
  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["Profile"],
      OUT: {},
      P: {}
    },
    graph,
    setGraph
  );
  return <div>ProfileSettings
      <PageViewWrapper
        formDataId={formDataId}
        formMetaId={formMeta.vertex?.id}
        hideSaveCancelButton={true}
        isNoPermissionCheck={true}
        metaTxnId={metaTxnId}
        pageVertexName="Profile"
      />

  </div>;
}

 function SettingsContent() {
  const [graph] = useGraph();
  const [selectedMenu, setSelectedMenu] = createSignal("profile");

  const isAdmin = () => getGlobalStore(graph).P.userRoles.includes("admin");

  const menuItems = [
    {
      component: "ProfileSettings",
      id: "profile",
      label: "Profile"
    },
    {
      component: "PasswordSettings",
      id: "password",
      label: "Change Password"
    },
    {
      adminOnly: true,
      component: "EmailSettings",
      id: "email",
      label: "Email Settings"
    }
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
                  class={`p:12px cursor:pointer r:4px mb:8px ${selectedMenu() === item.id
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
