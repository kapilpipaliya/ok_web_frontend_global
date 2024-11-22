import { Show, useContext } from "solid-js";
import { For, Match, Switch } from "solid-js";

import { FormContext } from "../form/FormContext";

export function FormError(props: { class?: string }) {
  const formSchema = useContext(FormContext);

  // TODO: Fix this component
  return (
    <Switch>
      <Match when={formSchema.error}>
        <div class={`text-red-500 form-error-message ${props.class || ""}`}>
          <Show
            fallback={<span>{formSchema.error}</span>}
            when={Array.isArray(formSchema.error)}
          >
            <ul>
              <For each={formSchema.error as string[]}>
                {(err) => <li>{err}</li>}
              </For>
            </ul>
          </Show>
        </div>
      </Match>
    </Switch>
  );
}
