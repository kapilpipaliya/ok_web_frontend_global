import { Icon } from "@iconify-icon/solid";
import { type Accessor, For, type Setter, createSignal, Show, useContext } from "solid-js";
import { Tooltip } from "~/components/solid_blocks/tooltip/tooltip";
import logo from "~/assets/graphics/sidebarLogo.svg";
import { CustomModal } from "~/components/CommonDialog";
import { CustomButton } from "~/components/solid_blocks/button/buttons";
import { ShareSection } from "./PageShare";
import { useNavigate } from "@solidjs/router";
import { useToast } from "~/components/Toast";
import { ProcessStatus, commitTxn, getNewTxnId } from "~/lib/graph/transaction";
import { checkIfNameExistsMGCall } from "~/cypher/get/checkIfNameExists";
import { submitDataCall } from "~/lib/api/api_functions";
import { PageConfigContext } from "~/lib/contexts";
import { GraphContext, IdAttr, } from "~/lib/graph/graph";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";

export function HeaderDragAndDrop(props: {
  view: Accessor<string>;
  setView: Setter<string>;
  selectedSection: Accessor<string>;
  setSelectedSection: Setter<string>;
}) {
  const [openDialog, setOpenDialog] = createSignal(false);
  const { showWarningToast, showLoadingToast, showErrorToast } = useToast();
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const txnId = getNewTxnId(graph, setGraph);
  const [pageConfig, setPageConfig] = useContext(PageConfigContext) || [];
  const views = [
    { key: "prime:mobile", value: "Mobile", icon: true },
    { key: "uil:tablet", value: "Tablet", icon: true },
    { key: "humbleicons:desktop", value: "Desktop", icon: true },
  ];

  const navigate = useNavigate();

  const removeLastPathSegment = () => {
    if (window.history.state === 1) {
      const pathname = window.location.pathname;
      const segments = pathname.split("/");
      segments.pop();
      return segments.join("/");
    } else {
      return -1
    }
  };

  const handleSubmit = async () => {
    // we cant have validationGroup when doing code. can we register components on the fly to enable validations?
    // const result = validationGroup.validate();
    const isValid = true;
    const isRealTime = false;
    let data;

    if (isValid) {
      // !!!TODO!!! Handle Error Received From server when commit
      if (!isRealTime) {
        data = commitTxn(txnId, Ws);
        if (!data) {
          showWarningToast("Internal Server Error");
          setTimeout(() => navigate(-1), 0);
          return;
        }

        const name = pageConfig.formData.formData.P[IdAttr];
        const res = await checkIfNameExistsMGCall(
          pageConfig.formData.formData.P[IdAttr],
          name,
          pageConfig.formData.formData.id
        );

        if (res.error) {
          showErrorToast(res.message);
          return;
        }

        await showLoadingToast({
          promise: submitDataCall({ ...data, name }, graph, setGraph, txnId),
          loadMessage: "Submitting Data...",
          successMessage: "Data submitted successfully",
          onSuccess: () => {
            graph.transactions.get(txnId)!.status = ProcessStatus.AckReceived;
            // currently we are navigating back.
            // setTimeout(() => navigate(-1), 500);
          },
          onError: () => {
            showErrorToast("Data submission failed");
           },
        });
      }
    } else {
      showWarningToast("Please fix all errors");
    }

    if (!data) {
      setTimeout(() => navigate(-1), 0);
    }

    return isValid;
  };
  const LeftIcons = () => (<div class="flex ai:center">
    <div
      class="bg:rgb(255,253,253,.5) flex ai:center jc:center bg:rgb(232,229,229):hover r:5|5|5|5 h:30px w:30px cursor:pointer"
      onclick={() => navigate(removeLastPathSegment() as any)}
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
      <img style="height: 35px;" src={logo} alt="logo" />
    </a>
  </div>
  );
  const ResizeViewButtons = () => (
    <For each={views}>
      {(view, index) => (
        <Tooltip content={view.value} position={"s"}>
          <button
            style={{
              "background-color": view.value === props.view() ? "#E0E7F3" : "",
              color: view.value === props.view() ? "#5252F1" : "grey",
            }}
            onclick={() => props.setView(view.value)}
            type="button"
            class={`rel d:inline-flex ai:center px:0.75rem py:0.5rem f:0.875rem font-weight:600 color:rgb(17,24,39) b:1px|solid|lightgrey cursor:default z:10:focus ${index() === 0 ? "r:5|0|0|5" : index() === 2 ? "r:0|5|5|0" : ""
              }`}
          >
            <Icon icon={view.key} height={22} width={22} />
          </button>
        </Tooltip>
      )}
    </For>
  );
  const MiddleSectionButtons = () => (
    <>
      <For each={["Build", "Setting"]}>
        {(section) => (
          <Tooltip content={section} position={"s"}>
            <button
              style={{ "background-color": section === "Build" ? "" : "#E0E7F3", color: section === "Build" ? "grey" : "#5252F1" }}
              onclick={() => props.setSelectedSection(section.toLowerCase())}
              type="button"
              class={`rel d:inline-flex ai:center px:0.75rem py:0.5rem f:0.875rem font-weight:600 color:rgb(17,24,39) b:1px|solid|lightgrey cursor:default z:10:focus ${section === "Build" ? "r:5|0|0|5" : "r:0|5|5|0"}`}
            >
              <Icon
                icon={section === "Build" ? "material-symbols-light:build-circle-outline-rounded" : "solar:settings-linear"}
                height={22}
                width={22}
              />
            </button>
          </Tooltip>
        )}
      </For>
    </>
  );

  return (
    <header class="h:50px" style={{ "grid-area": "header" }}>
      <div class="flex-grow:1 min-w:400 grid ji:center">
        <div class="ai:center align-items:center bg:#f3f3f4 display:flex flex h:49px jc:space-between mb:5 p:10 r:7 w:99%">
          <LeftIcons />
          <div>
            <Show when={props.selectedSection() === "build"}>
              <div class="flex ai:center w:150 ml:38%">
                <ResizeViewButtons />
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
              <MiddleSectionButtons />
            </Show>
          </div>
          <div class="ai:center justify-content:space-between flex gap:5">
            <Tooltip content={"Save"} position={"s"}>
              <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px    w:37px cursor:pointer" onClick={handleSubmit}>
                <Icon icon={"bi:floppy"} height={22} width={22} />
              </div>
            </Tooltip>
            <Tooltip content={"Preview"} position={"s"}>
              <div onClick={() => window.open(`/view/${pageConfig.formData.formData.L[0]}/${pageConfig.formData.formData.P.name}/preview`)} class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:35px    w:37px cursor:pointer">
                <Icon icon={"ph:eye"} height={22} width={22} />
              </div>
            </Tooltip>            <ExportSection setOpenDialog={setOpenDialog} openDialog={openDialog} />
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
        <Tooltip content={"Share"} position={"s"}>
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