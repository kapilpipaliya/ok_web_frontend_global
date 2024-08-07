import type { JSX } from "solid-js";

import { createEffect, mergeProps, untrack } from "solid-js";
import { omitProps } from "solid-use/props";

import type {
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
} from "../../utils/dynamic-prop";

import { useAutocompleteState } from "../../states/create-autocomplete-state";
import { useDisclosureState } from "../../states/create-disclosure-state";
import createDynamic from "../../utils/create-dynamic";
import { createForwardRef } from "../../utils/dynamic-prop";
import {
  createARIADisabledState,
  createARIAExpandedState,
  createDisabledState,
  createExpandedState,
  createHasActiveState,
  createHasQueryState,
  createHasSelectedState,
} from "../../utils/state-props";
import useEventListener from "../../utils/use-event-listener";
import { COMMAND_INPUT_TAG } from "../command/tags";
import { useComboboxContext } from "./ComboboxContext";

export type ComboboxInputProps<T extends ValidConstructor = "input"> =
  HeadlessPropsWithRef<T>;

export function ComboboxInput<T extends ValidConstructor = "input">(
  props: ComboboxInputProps<T>,
): JSX.Element {
  const context = useComboboxContext("ComboboxInput");
  const autocompleteState = useAutocompleteState();
  const disclosureState = useDisclosureState();
  const [internalRef, setInternalRef] = createForwardRef(props);

  const isDisabled = (): boolean | undefined =>
    autocompleteState.disabled() || props.disabled;

  createEffect(() => {
    const current = internalRef();
    if (current instanceof HTMLElement) {
      context.anchor = current;

      if (current instanceof HTMLInputElement) {
        useEventListener(current, "input", () => {
          if (!isDisabled()) {
            autocompleteState.setQuery(current.value);
          }
        });
      }

      useEventListener(current, "keydown", (e) => {
        if (!isDisabled()) {
          switch (e.key) {
            case "Escape": {
              disclosureState.close();
              break;
            }
            case "ArrowUp": {
              e.preventDefault();
              if (disclosureState.isOpen()) {
                context.controller.setPrevChecked(true);
              } else {
                disclosureState.open();
              }
              break;
            }
            case "ArrowDown": {
              e.preventDefault();
              if (disclosureState.isOpen()) {
                context.controller.setNextChecked(true);
              } else {
                disclosureState.open();
              }
              break;
            }
            case "Enter": {
              e.preventDefault();
              if (disclosureState.isOpen()) {
                context.selectedDescendant = context.activeDescendant;
              }
              break;
            }
            default:
              break;
          }
        }
      });
      useEventListener(current, "click", () => {
        if (!isDisabled()) {
          disclosureState.toggle();
        }
      });
      useEventListener(current, "blur", (e) => {
        if (context.optionsHovering) {
          return;
        }
        autocompleteState.blur();
        if (!(e.relatedTarget && current.contains(e.relatedTarget as Node))) {
          disclosureState.close();
        }
      });
      useEventListener(current, "mouseenter", () => {
        context.inputHovering = true;
      });
      useEventListener(current, "mouseleave", () => {
        context.inputHovering = false;
      });
    }
  });

  createEffect(() => {
    if (autocompleteState.query() !== "") {
      if (untrack(() => disclosureState.isOpen())) {
        context.controller.setFirstChecked();
      } else {
        disclosureState.open();
      }
    }
  });

  createEffect(() => {
    if (context.activeDescendant) {
      const current = document.getElementById(context.activeDescendant);
      if (current) {
        context.controller.setCurrent(current);
      }
    }
  });

  return createDynamic(
    () => props.as || ("input" as T),
    mergeProps(
      omitProps(props, ["as", "ref"]),
      {
        get "aria-activedescendant"() {
          return context.activeDescendant;
        },
        "aria-controls": context.optionsID,
        get "aria-expanded"() {
          return disclosureState.isOpen();
        },
        // Controls the options listbox
        "aria-haspopup": "listbox",
        "aria-labelledby": context.labelID,

        id: context.inputID,
        ref: setInternalRef,
        role: "combobox",

        // Guarantee it's interactive
        tabindex: 0,
        // Guarantee it's a text
        type: "text",
      },
      COMMAND_INPUT_TAG,
      createDisabledState(isDisabled),
      createARIADisabledState(isDisabled),
      createExpandedState(() => disclosureState.isOpen()),
      createARIAExpandedState(() => disclosureState.isOpen()),
      createHasSelectedState(() => autocompleteState.hasSelected()),
      createHasActiveState(() => autocompleteState.hasActive()),
      createHasQueryState(() => autocompleteState.hasQuery()),
    ) as DynamicProps<T>,
  );
}
