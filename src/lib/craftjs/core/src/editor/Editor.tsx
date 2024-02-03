import { ERROR_RESOLVER_NOT_AN_OBJECT, HISTORY_ACTIONS } from "@craftjs/utils/src";
import {JSXElement, createEffect, onCleanup, splitProps, Show} from "solid-js";
import invariant from "tiny-invariant";

import { EditorContext } from "./EditorContext";
import { useEditorStore } from "./store";

import { Events } from "../events";
import { Options } from "../interfaces";

/**
 * A SolidJS Component that provides the Editor context
 */
export const Editor = (props: Partial<Options> & { children: JSXElement }) => {
  // Destructuring children and options from props
  const [children, options] = splitProps(props, ["children"]);

  // we do not want to warn the user if no resolver was supplied
  if (options.resolver !== undefined) {
    invariant(
      typeof options.resolver === "object" && !Array.isArray(options.resolver) && options.resolver !== null,
      ERROR_RESOLVER_NOT_AN_OBJECT,
    );
  }

  const context = useEditorStore(options, (state, previousState, actionPerformedWithPatches, query, normalizer) => {
    if (!actionPerformedWithPatches) {
      return;
    }

    const { patches, ...actionPerformed } = actionPerformedWithPatches;

    for (let i = 0; i < patches.length; i++) {
      const { path } = patches[i];
      const isModifyingNodeData = path.length > 2 && path[0] === "nodes" && path[2] === "data";

      let actionType = actionPerformed.type;

      if ([HISTORY_ACTIONS.IGNORE, HISTORY_ACTIONS.THROTTLE].includes(actionType) && actionPerformed.params) {
        actionPerformed.type = actionPerformed.params[0];
      }

      if (["setState", "deserialize"].includes(actionPerformed.type) || isModifyingNodeData) {
        normalizer((draft) => {
          if (state.options.normalizeNodes) {
            state.options.normalizeNodes(draft, previousState, actionPerformed, query);
          }
        });
        break; // we exit the loop as soon as we find a change in node.data
      }
    }
  });

  // sync enabled prop with editor store options
  createEffect(() => {
    if (!context) {
      return;
    }

    if (options.enabled === undefined || context.query.getOptions().enabled === options.enabled) {
      return;
    }

    context.actions.setOptions((editorOptions) => {
      editorOptions.enabled = options.enabled;
    });
  });

  // Additional effect for subscription
  createEffect(() => {
    context.subscribe(
      (_) => ({
        json: context.query.serialize(),
      }),
      () => {
        context.query.getOptions().onNodesChange(context.query);
      },
    );

    // Cleanup function
    onCleanup(() => {
      // Any cleanup logic if necessary
    });
  });

  return (
    <Show when={context}>
      <EditorContext.Provider value={context}>
        <Events>{props.children}</Events>
      </EditorContext.Provider>
    </Show>
  );
};
