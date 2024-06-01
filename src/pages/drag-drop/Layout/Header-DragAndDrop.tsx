import { Icon } from "@iconify-icon/solid";
import { type Accessor, For, type Setter, createSignal } from "solid-js";
import { Tooltip } from "~/components/solid-blocks/blocks/tooltip/tooltip";
import logo from "~/assets/graphics/sidebarLogo.svg";
import { ToggleButton } from "~/components/css-properties/css-components/ToggleButton";
import CustomModal from "~/components/custom/CommonDialog";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import { TextEditor } from "~/components/css-properties/css-tabs/TextEditor";
import { CenterDiv } from "~/components/css-properties/css-components/CssUtils";
import ShareSection from "../Share";
import { APP_BASE_URL } from "~/lib/Utils";
import { useLocation, useNavigate } from "@solidjs/router";

export function HeaderDragAndDrop(props: {
  view: Accessor<string>;
  setView: Setter<string>;
}) {
  const [openDialog, setOpenDialog] = createSignal(false);
  const views = [
    { key: 'prime:mobile', value: 'Mobile', icon: true },
    { key: 'uil:tablet', value: 'Tablet', icon: true },
    { key: 'humbleicons:desktop', value: 'Desktop', icon: true },
  ];

  const navigate = useNavigate();
  function removeLastPathSegment() {
    const pathname = window.location.pathname;
    const segments = pathname.split('/');
    segments.pop(); // Remove the last segment
    const newPathname = segments.join('/');
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
          <div class="w:150">
            <For each={views}>
              {(view, index) => {
                return <Tooltip content={view.value} position={"n"}>
                  <button style={{ 'background-color': view.value === props.view() ? '#E0E7F3' : '', color: view.value === props.view() ? '#5252F1' : 'grey' }} onclick={() => props.setView(view.value)} type="button" class={`rel  d:inline-flex  ai:center px:0.75rem py:0.5rem f:0.875rem font-weight:600 color:rgb(17,24,39) b:1px|solid|lightgrey cursor:default z:10:focus ${index() === 0 ? "r:5|0|0|5" : index() === 2 ? "r:0|5|5|0" : ""}`}>
                  <Icon icon={view.key} height={22} width={22} />
                </button>
                </Tooltip>
              }}
            </For>
          </div>

          <div class={"ai:center justify-content:space-between flex gap:5"}>
            <PreviewSection setOpenDialog={setOpenDialog} openDialog={openDialog} />
            <ExportSection setOpenDialog={setOpenDialog} openDialog={openDialog} />
          </div>
        </div>
      </div>
    </header>
  );
}

const ExportSection = (props: { setOpenDialog: Setter<boolean>, openDialog: Accessor<boolean> }) => {
  return <CustomModal
    dialogClass=""
    title={"Code"}
    openButton={false}
    buttonLabel={<Tooltip content={"Share"} position={"n"}>
      <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px    w:37px cursor:pointer">
        <Icon icon={"basil:share-box-outline"} height={22} width={22} />
      </div>
    </Tooltip>}
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
    open={props.openDialog()} />;
}
const PreviewSection = (props: { setOpenDialog: Setter<boolean>, openDialog: Accessor<boolean> }) => {
  return <CustomModal
    dialogClass=""
    title={"Preview"}
    openButton={false}
    buttonLabel={<Tooltip content={"Preview"} position={"n"}>
      <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px    w:37px cursor:pointer">
        <Icon icon={"ph:eye"} height={22} width={22} />
      </div>
    </Tooltip>}
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
    open={props.openDialog()} />;
}

