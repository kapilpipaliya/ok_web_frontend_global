import { ParentProps } from "solid-js";
import { KeyedContext } from "~/components/fields/KeyedContext";
import { createAppState } from "~/createAppState";
import { GetInitialData } from "~/GetInitialData";

export const TemplateGraphProvider = (props: ParentProps) => {
  const graph = createAppState();
  graph[1]("url", "https://admin_panel_ui_components.easyformforge.in/");

  return (
    <KeyedContext context={graph} name="templateGraph">
      <GetInitialData>{props.children}</GetInitialData>
    </KeyedContext>
  );
};
