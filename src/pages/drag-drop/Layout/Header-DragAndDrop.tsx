import { Icon } from "@iconify-icon/solid";
import { Tooltip } from "~/components/solid-blocks/blocks/tooltip/tooltip";

export function HeaderDragAndDrop(props: {
  NavigationBar: any;
  steps: any;
  getStepId: any;
  onChangeStep: any;
}) {
  return (
    <header style={{ "grid-area": "header" }}>
      <div class="flex-grow:1 min-w:400 grid ji:center">
        <div
          class={
            "ai:center align-items:center bg:#f3f3f4 display:flex flex h:50px jc:space-between mb:5 p:10 r:7 w:90%"
          }
        >
          <props.NavigationBar
            steps={props.steps}
            getStepId={props.getStepId}
            onChangeStep={props.onChangeStep}
          />
          <div class={"ai:center justify-content:space-between flex gap:5"}>
            <Tooltip content={"Undo"} position={"n"}>
              <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
                <Icon icon={"ci:arrow-undo-up-left"} height={22} width={22} />
              </div>
            </Tooltip>
            <Tooltip content={"Redo"} position={"n"}>
              <div class="b:1px|solid|lightgrey color:#000:hover color:grey bg:white flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
                <Icon icon={"ci:arrow-undo-up-right"} height={22} width={22} />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
}
