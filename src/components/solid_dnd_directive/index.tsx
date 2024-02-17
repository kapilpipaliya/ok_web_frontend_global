import { dndzone as dndActionZone, setDebugMode, SOURCES, TRIGGERS, overrideItemIdKeyNameBeforeInitialisingDndZones as overrideId, Options } from "svelte-dnd-action";
import {createEffect, createRenderEffect, onMount, onCleanup, createSignal} from "solid-js";
import {createFlipper, Flipper} from "./flip";
export {
  TRIGGERS,
  SOURCES,
  SHADOW_ITEM_MARKER_PROPERTY_NAME,
  SHADOW_PLACEHOLDER_ITEM_ID,
  DRAGGED_ELEMENT_ID,
  alertToScreenReader,
  setDebugMode
} from "svelte-dnd-action";

const DEFAULT_FLIP_DURATION_MS = 150;
let ID_KEY = "id";
export function overrideItemIdKeyNameBeforeInitialisingDndZones(newId:string) {
  overrideId(newId);
  ID_KEY = newId;
}

type SolidOptions = {
  items: () => Array<Record<string, any>>; /**a getter the list of items (SIGNAL or a getter to STORE value) that was used to generate the children of the given node (the list used in the `<For>` block*/
  type?: string | (() => string); /**the type of the dnd zone. children dragged from here can only be dropped in other zones of the same type, default to a base type*/
  flipDurationMs?: number | (() => number); /**the duration of the flip animation. zero means no animation*/
  dragDisabled?: boolean | (() => boolean);
  morphDisabled?: boolean | (() => boolean); /**whether dragged element should morph to zone dimensions*/
  dropFromOthersDisabled?: boolean | (() => boolean);
  zoneTabIndex?: number | (() => number); /**set the tabindex of the list container when not dragging*/
  dropTargetStyle?: Record<string, string> | (() => Record<string, string>);
  dropTargetClasses?: string[] | (() => string[]);
};

export function createDragHandle() {
  const [dragDisabled, setDragDisabled] = createSignal(true);
  function dragHandleZone(node: HTMLElement, optionsGetter: () => SolidOptions) {
    const options = optionsGetter();
    validateOptions(options);
    const optionsAsGetters = addDefaultOptions(optionsToGetters(options));
    const {flipDurationMs: getFlipDurationMs} = optionsAsGetters;
    const getItems = optionsAsGetters.items as () => Array<Record<string, any>>;
    let flipper: (Flipper | undefined) = undefined;

    const zone = dndActionZone(node, gettersToOptions(optionsAsGetters));
    const {update, destroy} = zone;

    onMount(() => {
      onCleanup(destroy);
      createEffect(function updateOptionsAndTriggerFlip() {
        update({...gettersToOptions(optionsAsGetters),
          // added drag handle:
          dragDisabled: dragDisabled()
        });
        flipper?.flip(getItems().map(item => item[ID_KEY]));
      });
    });
    createEffect(function updateFlipperWhenFipDurationChanges() {
      flipper = createFlipper(node, getFlipDurationMs())
    })
    createRenderEffect(function storeFlipInformation() {
      function adaptConsider(e: any) {
        flipper?.read(getItems().map(item => item[ID_KEY]));

        // added drag handle:
        const {
          info: { source, trigger },
        } = e.detail;
        // Ensure dragging is stopped on drag finish via keyboard
        if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
          setDragDisabled(true);
        }
      }

      function adaptFinalize(e: any) {
        flipper?.read(getItems().map(item => item[ID_KEY]));

        // added drag handle:
        const {
          info: { source },
        } = e.detail;
        // Ensure dragging is stopped on drag finish via pointer (mouse, touch)
        if (source === SOURCES.POINTER) {
          setDragDisabled(true);
        }
      }

      node.addEventListener('consider', adaptConsider);
      node.addEventListener('finalize', adaptFinalize);
      onCleanup(() => {
        node.removeEventListener('consider', adaptConsider);
        node.removeEventListener('finalize', adaptFinalize)
      })
    });
  }

  function dragHandle(node: HTMLElement) {
    function startDrag(e: Event) {
      // preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
      e.preventDefault();
      setDragDisabled(false);
    }
    function stopDrag(e: any) {
      setDragDisabled(true);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " ") setDragDisabled(false);
    }

    createEffect(() => {
      node.tabIndex = dragDisabled() ? 0 : -1;
      node.style.cursor = dragDisabled() ? "grab" : "grabbing";
    });

    createRenderEffect(function () {
      node.addEventListener("mousedown", startDrag);
      node.addEventListener("touchstart", startDrag);
      node.addEventListener("keydown", handleKeyDown);
      node.addEventListener("mouseup", stopDrag);
      node.addEventListener("touchend", stopDrag);
      onCleanup(() => {
        node.removeEventListener("mousedown", startDrag);
        node.removeEventListener("touchstart", startDrag);
        node.removeEventListener("keydown", handleKeyDown);
        node.removeEventListener("mouseup", stopDrag);
        node.removeEventListener("touchend", stopDrag);
      })
    });
  }
  return {
    dragHandleZone,
    dragHandle,
    dragDisabled
  };
}

/* Helper functions */
function makeGetter(option: any) {
  return (typeof option === "function") ? option : () => option;
}

/**
 * Converts an object with either getters or values to an object of getters so that all of the element can be treated the same
 */
function optionsToGetters(options: Record<string, any>) {
  return Object.keys(options).reduce((res:Record<string, any>, optName) => {res[optName] = makeGetter(options[optName]); return res;}, {}) as Record<string, () => any>;
}
function validateOptions(options: SolidOptions) {
  if(typeof options.items !== "function") {
    throw new Error(`dndzone didn't get an items getter, which is a mandatory option in ${JSON.stringify(options)}`);
  }
}
function addDefaultOptions(optionGetters: Record<string, () => any>) {
  if (typeof optionGetters.flipDurationMs !== "function") {
    return {...optionGetters, flipDurationMs: () => DEFAULT_FLIP_DURATION_MS}
  }
  return  optionGetters;
}

/**
 * Calls each getter and maps it to its value (so it can be given to the lib
 */
function gettersToOptions(optionGetters: Record<string, () => any>) : Options {
  return Object.keys(optionGetters).reduce((res:Record<string, any>, optName) => {res[optName] = optionGetters[optName](); return res;}, {}) as Options;
}

// copied drag handle code from:
// https://github.com/isaacHagoel/svelte-dnd-action/issues/251
