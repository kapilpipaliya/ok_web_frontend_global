import { Dynamic } from "solid-js/web";
import {
  ErrorBoundary,
  Match,
  Show,
  Switch,
  splitProps,
  type JSX,
} from "solid-js";

import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import { ComponentField } from "~/components/fields/component/ComponentField";
import {
  PreviewContext,
  usePreviewContext,
} from "~/features/page_designer/context/PreviewContext";

import type { Vertex } from "~/lib/graph/type/vertex";
import type { DynamicPropsType } from "~/components/form/dynamic_component/functions/DynamicPropsType";
import type { PermissionsObject } from "~/components/form/dynamic_component/hooks/useComponentPermissions";
import { mergeRefs } from "@solid-primitives/refs";

// Props for the content component
type ContentProps = {
  meta: Vertex;
  data?: Vertex;
  children?: JSX.Element;
  dynamicProps: () => DynamicPropsType;
  mergedClasses: () => Record<string, string>;
  permissions: () => PermissionsObject;
  component: () => any;
  processedText: () => string | undefined;
  disabled?: boolean;
  ref: () => HTMLElement | null;
  setRef: (ref: HTMLElement | null) => void;
  isNoPermissionCheck: () => boolean;
};

function resolveChildrenProps(
  dynamicProps: DynamicPropsType,
  parentChildren?: JSX.Element,
) {
  const { children: childrenFromProps, ...componentDynamicProps } = dynamicProps;
  const childrenFn =
    typeof childrenFromProps === "function" ? childrenFromProps : undefined;
  const slotContent =
    parentChildren ??
    (childrenFromProps !== undefined &&
    childrenFromProps !== null &&
    typeof childrenFromProps !== "function"
      ? (childrenFromProps as JSX.Element)
      : undefined);

  return {
    componentDynamicProps,
    childrenFn,
    slotContent,
    renderGraphChildren: !childrenFn && slotContent === undefined,
  };
}

// The main content component
export function Content(props: ContentProps) {
  const ignoreMetaKeys = [
    "hide",
    "children",
    "projections",
    "props",
    "fns",
    "mounted",
    "hideLabel",
    "class",
    "validation",
    "labelClass",
    // "key", // we can't remove key, because it's used in the component field
    "displayOrder",
    "isNoPermissionCheck",
    "css",
  ];

  const [, otherProps] = splitProps(props.meta.P, ignoreMetaKeys);
  const resolved = () =>
    resolveChildrenProps(props.dynamicProps(), props.children);

  return (
    <>
      <ErrorBoundary
        fallback={(err) => {
          console.error(err);
          return <div>Error: {err.message}</div>;
        }}
      >
        <Switch>
          <Match when={resolved().childrenFn != null}>
            <Dynamic
              {...otherProps}
              {...resolved().componentDynamicProps}
              componentName={null}
              hide={null}
              {...props.mergedClasses()}
              component={props.component()}
              text={props.processedText()}
              ref={mergeRefs(props.setRef, props.dynamicProps().ref)}
              children={resolved().childrenFn!}
            />
          </Match>
          <Match when={true}>
            <Dynamic
              {...otherProps}
              {...resolved().componentDynamicProps}
              componentName={null}
              hide={null}
              {...props.mergedClasses()}
              component={props.component()}
              text={props.processedText()}
              ref={mergeRefs(props.setRef, props.dynamicProps().ref)}
            >
              <Show
                fallback={
                  <Show when={resolved().renderGraphChildren && props.meta.id}>
                    <PageAttrRender
                      data={props.data}
                      isNoPermissionCheck={props.isNoPermissionCheck()}
                      metaVertex={props.meta}
                    />
                  </Show>
                }
                when={resolved().slotContent}
              >
                {resolved().slotContent}
              </Show>
            </Dynamic>
          </Match>
        </Switch>
      </ErrorBoundary>
    </>
  );
}

// The content wrapper component
export function ContentWrapper(props: ContentProps) {
  const [previewStore, setPreviewStore] = usePreviewContext();
  const previewStoreProxy = new Proxy(previewStore, {
    get(target, prop) {
      if (prop === "isDesignMode") {
        return false;
      }
      if (prop === "isDesignModePrev") {
        return target.isDesignMode;
      }
      return target[prop as keyof typeof target];
    },
  });
  return (
    <Switch>
      <Match when={props.component() === ComponentField}>
        <PreviewContext.Provider value={[previewStoreProxy, setPreviewStore]}>
          <Content {...props} />
        </PreviewContext.Provider>
      </Match>
      <Match when={true}>
        <Content {...props} />
      </Match>
    </Switch>
  );
}
