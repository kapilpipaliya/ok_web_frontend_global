import { Icon } from "@iconify-icon/solid";
import { type Accessor, For, type Setter, createSignal, Show } from "solid-js";
import { Tooltip } from "~/components/solid-blocks/blocks/tooltip/tooltip";
import logo from "~/assets/graphics/sidebarLogo.svg";
import CustomModal from "~/components/custom/CommonDialog";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import ShareSection from "../Share";
import { useNavigate } from "@solidjs/router";

export function HeaderDragAndDrop(props: {
  view: Accessor<string>;
  setView: Setter<string>;
  selectedSection: Accessor<string>;
  setSelectedSection: Setter<string>;
}) {
  const [openDialog, setOpenDialog] = createSignal(false);
  const views = [
    { key: "prime:mobile", value: "Mobile", icon: true },
    { key: "uil:tablet", value: "Tablet", icon: true },
    { key: "humbleicons:desktop", value: "Desktop", icon: true },
  ];

  const navigate = useNavigate();
  function removeLastPathSegment() {
    const pathname = window.location.pathname;
    const segments = pathname.split("/");
    segments.pop(); // Remove the last segment
    const newPathname = segments.join("/");
    return newPathname;
  }
  return (
    <header class="h:50px" style={{ "grid-area": "header" }}>
      <div class="flex-grow:1 min-w:400 grid ji:center">
        <div
          class={
            "ai:center align-items:center bg:#f3f3f4 display:flex flex h:50px jc:space-between mb:5 p:10 r:7 w:99%"
          }
        >
          <div class="flex ai:center">
            <div
              class="bg:rgb(255,253,253,.5) flex ai:center jc:center bg:rgb(232,229,229):hover r:5|5|5|5 h:30px w:30px cursor:pointer"
              onclick={() => {
                const newPath = removeLastPathSegment();

                navigate(newPath);
              }}
              title="Back"
            >
              <Icon
                icon={"flowbite:caret-left-outline"}
                class={"color:black:hover color:lightgrey"}
                height={30}
                width={30}
              />
            </div>
            <a href="/">
              <img style="height: 35px; " src={logo} alt="logo" />
            </a>
          </div>
          <div>
            <Show when={props.selectedSection() === "build"}>
              <div class="flex ai:center w:150">
                <For each={views}>
                  {(view, index) => {
                    return (
                      <Tooltip content={view.value} position={"s"}>
                        <button
                          style={{
                            "background-color":
                              view.value === props.view() ? "#E0E7F3" : "",
                            color:
                              view.value === props.view() ? "#5252F1" : "grey",
                          }}
                          onclick={() => props.setView(view.value)}
                          type="button"
                          class={`rel  d:inline-flex  ai:center px:0.75rem py:0.5rem f:0.875rem font-weight:600 color:rgb(17,24,39) b:1px|solid|lightgrey cursor:default z:10:focus ${
                            index() === 0
                              ? "r:5|0|0|5"
                              : index() === 2
                                ? "r:0|5|5|0"
                                : ""
                          }`}
                        >
                          <Icon icon={view.key} height={22} width={22} />
                        </button>
                      </Tooltip>
                    );
                  }}
                </For>
                <Icon
                  class="ml:10"
                  icon="solar:settings-linear"
                  height={22}
                  width={22}
                  onClick={() => props.setSelectedSection("setting")}
                />
              </div>
            </Show>
            <Show when={props.selectedSection() === "setting"}>
              <Tooltip content={"Build"} position={"s"}>
                <button
                  style={{
                    "background-color": "",
                    color: "grey",
                  }}
                  onclick={() => props.setSelectedSection("build")}
                  type="button"
                  class={`rel  d:inline-flex  ai:center px:0.75rem py:0.5rem f:0.875rem font-weight:600 color:rgb(17,24,39) b:1px|solid|lightgrey cursor:default z:10:focus r:5|0|0|5
                    }`}
                >
                  <Icon
                    icon={"material-symbols-light:build-circle-outline-rounded"}
                    height={22}
                    width={22}
                  />
                </button>
              </Tooltip>
              <Tooltip content={"Setting"} position={"s"}>
                <button
                  style={{
                    "background-color": "#E0E7F3",
                    color: "#5252F1",
                  }}
                  onclick={() => props.setSelectedSection("setting")}
                  type="button"
                  class={`rel  d:inline-flex  ai:center px:0.75rem py:0.5rem f:0.875rem font-weight:600 color:rgb(17,24,39) b:1px|solid|lightgrey cursor:default z:10:focus r:0|5|5|0
                    }`}
                >
                  <Icon icon={"solar:settings-linear"} height={22} width={22} />
                </button>
              </Tooltip>
            </Show>
          </div>

          <div class={"ai:center justify-content:space-between flex gap:5"}>
            <PreviewSection
              setOpenDialog={setOpenDialog}
              openDialog={openDialog}
            />
            <ExportSection
              setOpenDialog={setOpenDialog}
              openDialog={openDialog}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

const ExportSection = (props: {
  setOpenDialog: Setter<boolean>;
  openDialog: Accessor<boolean>;
}) => {
  return (
    <CustomModal
      dialogClass=""
      title={"Code"}
      openButton={false}
      buttonLabel={
        <Tooltip content={"Share"} position={"n"}>
          <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px    w:37px cursor:pointer">
            <Icon icon={"basil:share-box-outline"} height={22} width={22} />
          </div>
        </Tooltip>
      }
      body={<ShareSection />}
      footer={(toggle) => (
        <div class="flex ai:center jc:flex-end">
          <CustomButton
            variant="soft"
            onClick={() => {
              toggle(false);
            }}
          >
            Close
          </CustomButton>
        </div>
      )}
      setOpen={props.setOpenDialog}
      open={props.openDialog()}
    />
  );
};
const PreviewSection = (props: {
  setOpenDialog: Setter<boolean>;
  openDialog: Accessor<boolean>;
}) => {
  return (
    <CustomModal
      dialogClass=""
      title={"Preview"}
      openButton={false}
      buttonLabel={
        <Tooltip content={"Preview"} position={"n"}>
          <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px    w:37px cursor:pointer">
            <Icon icon={"ph:eye"} height={22} width={22} />
          </div>
        </Tooltip>
      }
      body={<ShareSection />}
      footer={(toggle) => (
        <div class="flex ai:center jc:flex-end">
          <CustomButton
            variant="soft"
            onClick={() => {
              toggle(false);
            }}
          >
            Close
          </CustomButton>
        </div>
      )}
      setOpen={props.setOpenDialog}
      open={props.openDialog()}
    />
  );
};
