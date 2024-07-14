import { Accessor, JSX, Match, Switch } from "solid-js";


export interface ComponentProps {
  centerComponent?: JSX.Element;
  index: Accessor<number>;
  label: string;
  openPopup: (index: number) => void;
  option: string;
}

export function Component(props: Readonly<ComponentProps>) {
  return (
    <Switch>
      <Match when={props.label.includes("Shadow")}>
        <button class="f:14 flex:1 mr:8px" onClick={() => props.openPopup(props.index())} type="button">
          {props.option.replaceAll("|", " ")}
        </button>
        <div class={`bg:#fff box-shadow:${props.option} h:20px mr:10 r:5 w:20px`} />
      </Match>
      <Match when={props.label.includes("Filter")}>
        <button class="f:14 flex:1 mr:8px" onClick={() => props.openPopup(props.index())} type="button">
          {props.option.replaceAll(")", "").replaceAll("(", " ")}
        </button>
      </Match>
      <Match when={props.label.includes("Transition")}>
        <button class="f:14 flex:1 mr:8px" onClick={() => props.openPopup(props.index())} type="button">
          {props.option.replaceAll("|", " ")}
        </button>
      </Match>
      <Match when={props.label.includes("Transform")}>
        <button class="f:14 flex:1 mr:8px" onClick={() => props.openPopup(props.index())} type="button">
          {props.option.replaceAll(")", "").replaceAll("(", " ")}
        </button>
      </Match>
      <Match when={props.centerComponent}>{props.centerComponent}</Match>
    </Switch>
  );
}
