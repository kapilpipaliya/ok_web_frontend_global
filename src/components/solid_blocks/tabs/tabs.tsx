import {
  type JSX,
  createContext,
  createEffect,
  createSelector,
  createSignal,
  createUniqueId,
  mergeProps,
  on,
  useContext,
  
} from "solid-js";

import "./tabs.css";

export type TabsProps = {
  index?: number;
  setIndex?: (index?: number) => void;
} & Omit<JSX.HTMLAttributes<HTMLElement>, "onchange">;

export const tabsContext = createContext<
  | [
      index: () => number,
      setIndex: (index: number) => void,
      isActive: (index: number) => boolean,
      getIndex: (isContainer: boolean) => number,
      id: string,
    ]
  | []
>([]);

export function Tabs(props: TabsProps) {
  const [index, setIndex] = createSignal(props.index || 0);
  const isActive = createSelector(index);
  const indices = { container: -1, tabs: -1 };
  const id = props.id || createUniqueId();
  createEffect(on(index, (index) => props.setIndex?.(index), { defer: true }));
  return (
    <tabsContext.Provider
      value={[
        index,
        (index: number) =>
          index > indices.tabs
            ? setIndex(indices.tabs)
            : index >= 0
              ? setIndex(index)
              : setIndex(0),
        isActive,
        (isContainer) => (isContainer ? ++indices.container : ++indices.tabs),
        id,
      ]}
    >
      <div classList={mergeProps(props.classList ?? {}, { "sb-tabs": true })}>
        {props.children}
      </div>
    </tabsContext.Provider>
  );
}

export type TabListProps = JSX.HTMLAttributes<HTMLDivElement>;

export const tabListContext = createContext("");

export function TabList(props: TabListProps) {
  return (
    <div
      role="tablist"
      {...props}
      aria-orientation={props["aria-orientation"]}
    />
  );
}

export type TabProps = JSX.HTMLAttributes<HTMLButtonElement>;

export function Tab(props: TabProps) {
  const [_index, setIndex, isActive, getIndex, id] = useContext(tabsContext);
  const [ref, setRef] = createSignal<HTMLButtonElement>();
  const index = getIndex ? getIndex(false) : -1;
  const active = () => isActive?.(index);
  createEffect(
    on(
      () => isActive?.(index),
      (active) => active && ref()?.focus(),
      { defer: true },
    ),
  );
  return (
    <button
      aria-controls={`${id}-container${index}`}
      aria-selected={active()}
      id={`${id}-tab${index}`}
      onClick={setIndex && [(index) => setIndex(index), index]}
      onKeyDown={
        setIndex && [
          (index, ev) =>
            ev.key === "Home"
              ? (ev.preventDefault(), ev.stopPropagation(), setIndex(0))
              : ev.key === "End"
                ? (ev.preventDefault(),
                  ev.stopPropagation(),
                  setIndex(Number.POSITIVE_INFINITY))
                : ev.key === "ArrowLeft"
                  ? setIndex(index - 1)
                  : ev.key === "ArrowRight"
                    ? setIndex(index + 1)
                    : 0,
          index,
        ]
      }
      ref={setRef}
      role="tab"
      tabIndex={!active() ? -1 : undefined}
      type="button"
      {...(active() ? {} : { tabIndex: -1 })}
      {...props}
    />
  );
}

export type TabContainerProps = JSX.HTMLAttributes<HTMLDivElement>;

export function TabContainer(props: TabContainerProps) {
  const [_index, _setIndex, isActive, getIndex, id] = useContext(tabsContext);
  const index = getIndex ? getIndex(true) : -1;
  return (
    <div
      aria-labelledby={`${id}-tab${index}`}
      hidden={!isActive || isActive(index) ? undefined : true}
      id={`${id}-container${index}`}
      role="tabpanel"
      tabIndex={isActive?.(index) ? 0 : undefined}
      {...props}
    />
  );
}
