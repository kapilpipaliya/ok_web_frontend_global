// ADD a Feature:
// When nested PageViewWrapper is used, children should get parent context too.
import { makeEventListener } from "@solid-primitives/event-listener";
import {
  type BeforeLeaveEventArgs,
  createAsync,
  useBeforeLeave,
} from "@solidjs/router";
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  Match,
  on,
  onCleanup,
  onMount,
  Show,
  Switch,
  untrack,
} from "solid-js";
import { isServer } from "solid-js/web";
import { v7 as uuidv7 } from "uuid";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Id, Vertex } from "~/lib/graph/graph";

import {
  FormContext,
  type FormStoreObject,
  getInitialFormStore,
} from "~/components/form/context/FormContext";
import { DialogWithButtons } from "~/components/styled/modal/DeleteDialog";
import { SimpleWarningAlert } from "~/components/styled/SimpleWarningAlert";
import { PageView } from "~/features/page_attr_render/PageView";
import {
  getConfiguredPermissions,
  hasPermissions,
} from "~/features/page_attr_render/permissions";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { useGraph } from "~/lib/graph/GraphContext";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import {
  addNewVertex,
  deleteVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/core/vertex";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { createCompContextVertex } from "~/lib/graph/mutate/vertex/createCompContextVertex";
import { createViewVertex } from "~/lib/graph/mutate/vertex/createViewVertex";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { saveStepIndex } from "~/lib/graph/transaction/steps/saveStepIndex";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";
import { setPreventUndoAtOrBeforeIndex } from "~/lib/graph/transaction/steps/setPreventUndoAtOrBeforeIndex";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import {
  parentComponentAttribute,
  parentTemplateAttribute,
} from "~/lib/meta/base/Comp";

import {
  fetchFormData,
  type FetchFormDataResult,
  type FetchFormMetaDataResult,
} from "./functions/fetchPageData";
import { fetchFormMetaData } from "./functions/fetchFormMetaData";
import { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

// Permission levels
export enum PermissionLevel {
  NONE = "NONE",
  VIEW = "VIEW",
  CREATE = "CREATE",
  EDIT = "EDIT",
  FULL = "FULL",
}

export function PageViewWrapper(
  props: Readonly<{
    closePopUp?: () => void;
    context?: Record<string, unknown>;
    dataId?: Id;
    dontConfirmExit?: boolean;
    expression?: string;
    formDataId?: Id;
    formId?: string;
    formMetaId?: Id;
    getFormData?: () => Promise<ServerResult>;
    hideSaveCancelButton?: boolean;
    initializeFormStoreParent?: (formStoreId: Id) => void;
    // openedFormId?: Id;
    isDesignMode?: boolean;
    isNoPermissionCheck?: boolean;
    metaTxnId?: number;
    pageId?: string;
    pageKeyName?: string;
    pageVertexName?: string;
    parentId?: Id;
    txnId?: string;
    uuid?: string;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const id = createMemo(() =>
    props.dataId === "new" ? undefined : props.dataId,
  );
  const layoutStoreId = props.uuid ?? uuidv7();
  const viewVertexObject = createViewVertex(
    { view: "Desktop" },
    graph,
    setGraph,
  );
  const componentVertexObject = createCompContextVertex({}, graph, setGraph);
  const initialFormStore = getInitialFormStore(graph, setGraph);
  const pageFormVertexObject = newVertex(layoutStoreId, ["PageForm"], {
    ...initialFormStore,
    componentValue: componentVertexObject.id,
    formId: props.pageVertexName,
    id: id()!,
    isFetching: false, // Add fetching state
    openedViews: [viewVertexObject.id],
    txnId: props.txnId ?? initialFormStore.txnId,
  });

  addNewVertex(0, pageFormVertexObject, graph, setGraph);

  const formStore = () =>
    graph.vertexes[pageFormVertexObject.id] as Vertex<FormStoreObject>;
  const setFormStore = (key: string, value: unknown) => {
    mergeVertexProperties<FormStoreObject>(
      0,
      pageFormVertexObject.id,
      graph,
      setGraph,
      { [key]: value },
    );
  };

  // Track error vertex ID
  let errorVertexId: string | undefined;

  function createErrorVertex(dataId: string) {
    // Delete previous error vertex if exists
    if (errorVertexId) {
      deleteVertex(0, errorVertexId, graph, setGraph);
    }

    errorVertexId = `${dataId}-error`;
    const errorVertex = newVertex(errorVertexId, ["Error"], {
      dataId: dataId,
      message: "",
      timestamp: new Date().toISOString(),
    });
    addNewVertex(0, errorVertex, graph, setGraph);
    return errorVertexId;
  }

  onCleanup(() => {
    for (const viewId of formStore()?.P?.openedViews ?? []) {
      deleteVertex(0, viewId, graph, setGraph);
    }
  });

  onCleanup(() => {
    deleteVertex(0, componentVertexObject.id, graph, setGraph);
  });

  // Delete error vertex on cleanup
  onCleanup(() => {
    if (errorVertexId) {
      deleteVertex(0, errorVertexId, graph, setGraph);
    }
  });

  // Note: onCleanUp will be called on reverse order of the cleanup functions
  onCleanup(() => {
    deleteVertex(0, pageFormVertexObject.id, graph, setGraph);
  });

  let onConfirmExit: () => void;
  const metaTxnId = props.metaTxnId ?? generateNewTxnId(graph, setGraph);
  const metaVertex = () => graph.vertexes[formStore().P.formMetaId!];
  const dataVertex = () => graph.vertexes[formStore().P.formDataId!];

  const [previewStore] = usePreviewContext();

  const getDynamicFns = () => {
    try {
      // Helper to evaluate fns from a vertex
      const evaluateFns = (fns: ((args: FunctionArgumentType) => Record<string, unknown>) | string | undefined | null) => {
        if (typeof fns === "function") {
          return fns({} as FunctionArgumentType) || {};
        }
        if (typeof fns === "string") {
          try {
            return new Function("args", fns)({} as FunctionArgumentType) || {};
          } catch (error) {
            console.error("Error evaluating fns:", error);
            return {};
          }
        }
        return {};
      };

      return evaluateFns(metaVertex()?.P.fns);
    } catch (error) {
      console.error("Error in dynamicFns:", error);
      return {};
    }
  }
  // const dynamicFns = createMemo(getDynamicFns);

  const isNoPermissionCheck = () =>
    props.isNoPermissionCheck ||
    metaVertex()?.P.isNoPermissionCheck ||
    previewStore.isNoPermissionCheck;


  const allConfiguredPermission = (() =>
    getConfiguredPermissions(
      getGlobalStore(graph).P.userRoles,
      metaVertex()!,
      graph,
    )
  );

  const permissions = {
    full: (() => checkPermission(PermissionLevel.FULL)),
    edit: (() => checkPermission(PermissionLevel.EDIT)),
    create: (() => checkPermission(PermissionLevel.CREATE)),
    view: (() => checkPermission(PermissionLevel.VIEW)),
    none: (() => checkPermission(PermissionLevel.NONE)),
  };

  function checkPermission(level: PermissionLevel) {
    if (isNoPermissionCheck()) {
      return true;
    }

    if (level === PermissionLevel.CREATE && !id()) {
      return hasPermissions(allConfiguredPermission(), level);
    }

    if (id()) {
      return hasPermissions(allConfiguredPermission(), level);
    }

    return false;
  }

  // Set permission flags on store
  // setFormStore("hasFullPermission", permissions.full());
  // setFormStore("hasEditPermission", permissions.edit());
  // setFormStore("hasCreatePermission", permissions.create());
  // setFormStore("hasViewPermission", permissions.view());
  // setFormStore("isNoPermissionCheck", isNoPermissionCheck());

  const checkAuthError = () => {
    if (id() && !(permissions.edit() || permissions.view())) {
      return `You are not authorized to edit or view ${props.pageVertexName}`;
    }
    if (!(id() || permissions.create())) {
      return `You are not authorized to create ${props.pageVertexName}`;
    }
    return "";
  };

  const constants = {
    dataId: props.dataId,
    expression: props.expression,
    formDataId: props.formDataId,
    formId: props.formId,
    formMetaId: props.formMetaId,
    getFormData: !!props.getFormData,
    isDesignMode: props.isDesignMode,
    isNoPermissionCheck: props.isNoPermissionCheck,
    pageKeyName: props.pageKeyName,
    pageVertexName: props.pageVertexName,
  };

  const metaData = createAsync(
    async () => {
      if (constants.pageKeyName === "favicon.ico") {
        return { error: "No meta data found" };
      }
      if (constants.formMetaId) {
        return {};
      }
      const metaResult = await fetchFormMetaData(
        constants.pageVertexName,
        constants.formId,
        constants.expression,
        constants.isDesignMode,
        constants.pageKeyName,
      );
      if (!metaResult) {
        return { error: "No meta data found" };
      }

      let formMetaId = constants.formMetaId;
      if (metaResult.data) {
        if (Array.isArray(metaResult.data.result)) {
          if (metaResult.data.result.length > 0) {
            formMetaId = metaResult.data.result[0].id;
          }
        } else if (isObject(metaResult.data.result)) {
          formMetaId = metaResult.data.result.id;
        }
      }

      const metaVertex = constants.formMetaId
        ? graph.vertexes[constants.formMetaId]
        : metaResult.data?.graph?.vertexes[formMetaId!];

      const isNoPermissionCheck =
        constants.isNoPermissionCheck ||
        metaVertex?.P?.isNoPermissionCheck ||
        previewStore.isNoPermissionCheck;

      // const allConfiguredPermissionLocal =
      //   getConfiguredPermissions(
      //     getGlobalStore(graph).P.userRoles,
      //     metaVertex!,
      //     graph,
      //   );
      // console.log("AllConfiguredPermissionLocal:", allConfiguredPermissionLocal);

      const idLocal = constants.dataId === "new" ? undefined : constants.dataId;

      // function isPermission(action: string) {
      //   const hasPermission = (
      //     isNoPermissionCheck ||
      //     (action === "insert" &&
      //       !idLocal &&
      //       hasPermissions(allConfiguredPermissionLocal, action, graph)) ||
      //     (!!idLocal &&
      //       hasPermissions(allConfiguredPermissionLocal, action, graph))
      //   );
      //   console.log(`CheckPermission for action ${action}:`, hasPermission);
      //   return hasPermission;
      // }
      // const permissions = {
      //   // delete: isPermission("delete"),
      //   edit: isPermission("edit"),
      //   insert: isPermission("insert"),
      //   view: isPermission("view"),
      // };
      // console.log("Permissions determined:", permissions);

      // const hasRequiredPermissionsLocal = metaVertex &&
      //     (permissions.insert() || permissions.edit() || permissions.view());
      // console.log("HasRequiredPermissionsLocal:", hasRequiredPermissionsLocal);

      if (idLocal && !constants.getFormData) {
        const dataResult = await fetchFormData(
          graph,
          metaResult,
          constants.formDataId,
          idLocal,
          isNoPermissionCheck,
          true, // shasRequiredPermissionsLocal,
          constants.pageVertexName,
        );
        return { dataResult, formMetaId, metaResult };
      }

      let result: { formMetaId?: string, metaResult?: FetchFormMetaDataResult, dataResult?: FetchFormDataResult, error?: string } = { formMetaId, metaResult };

      if (props.getFormData) {
        try {
          // Set fetching state to true before making the API call
          // setFormStore("isFetching", true);

          const data = await props.getFormData();

          // Set fetching state to false after the API call completes
          // setFormStore("isFetching", false);

          if (!data || data.error) {
            result = { ...result, error: data.error || "Error fetching form data" };
          } else {
            result = { ...result, dataResult: { data } };
          }
        } catch (error) {
          // Make sure to set fetching state to false in case of error
          // setFormStore("isFetching", false);
          result = { ...result, error: (error as Error).message };
        }
      }
      return result;
    },
    { deferStream: true },
  );

  function setFormMetaData(
    metaResult?: FetchFormMetaDataResult,
    formMetaId?: string,
  ) {
    if (props.formMetaId) {
      setFormStore("formMetaId", props.formMetaId);
      return true;
    }
    if (!metaResult) {
      return false;
    }
    if (metaResult.error) {
      setFormStore("error", metaResult.error);
      return false;
    }

    if (metaResult.data) {
      if (props.formId && graph.vertexes[props.formId]) {
        delete metaResult.data.graph!.vertexes[props.formId];
      }
      setGraphData(graph, setGraph, metaResult.data.graph!);
    }
    if (formMetaId) {
      setFormStore("formMetaId", formMetaId);
    }
    const form = metaResult.form;
    if (!(props.formMetaId || formStore().P.formMetaId || form)) {
      setFormStore("error", `${props.pageVertexName} is not configured`);
      return false;
    }
    if (form) {
      let formToUse = form;
      // improve performance
      if (PageDesignerLabels.includes(form.key!) || form.key === "Component") {
        formToUse = {
          ...form,
          attributes: form.attributes.map((attr) => ({
            ...attr,
            attributes: attr.attributes?.filter((a) => a.key !== "Attr"),
          })),
        };
      }

      const metaVertexResult = untrack(() =>
        createMeta(formToUse!, metaTxnId, graph, setGraph),
      );

      if (metaVertexResult.error) {
        return false;
      }
      setFormStore("formMetaId", metaVertexResult.vertex!.id);
    }
    return true;
  }

  function validateMetaVertex(): string {
    if (
      formStore().P.formMetaId &&
      !isNoPermissionCheck() &&
      ((["Form", "Page"].includes(metaVertex()?.L[0]) && !getDynamicFns().enabled?.()))
    ) {
      const errorMsg = `${props.pageVertexName} is not enabled. Please contact your administrator.`;
      setFormStore("error", errorMsg);
      return errorMsg;
    }

    if (!metaVertex()) {
      const errorMsg = "No form meta data found";
      setFormStore("error", errorMsg);
      return errorMsg;
    }

    if (!metaVertex()?.P.key) {
      const errorMsg = `No key for the ${props.pageVertexName}`;
      setFormStore("error", errorMsg);
      return errorMsg;
    }

    const authError = checkAuthError();
    if (authError) {
      setFormStore("error", authError);
      return authError;
    }

    return "";
  }

  props.initializeFormStoreParent?.(pageFormVertexObject.id);

  const processResult = (result?: { formMetaId?: string, metaResult?: FetchFormMetaDataResult, dataResult?: FetchFormDataResult }) => {
    if (!props.formMetaId && result) {
      untrack(() => {
        batch(() => {
          setFormMetaData(result?.metaResult, result?.formMetaId);
          const validationError = validateMetaVertex();
          if (!validationError) {
            handleFormData(result?.dataResult);
          }
        });
      });
    }
  }

  // Make SSR work when props.formMetaId is set
  untrack(() => {
    batch(() => {
      if (props.formMetaId) {
        setFormMetaData();
        const validationError = validateMetaVertex();
        if (!validationError) {
          handleFormData();
        }
      }
    });
  });

  // function hasRequiredPermissions() {
  //   return (
  //     metaVertex() &&
  //     (permissions.create() || permissions.edit() || permissions.view())
  //   );
  // }

  function handleFormData(result?: FetchFormDataResult) {
    if (props.formDataId) {
      setFormStore("formDataId", props.formDataId);
      return;
    }

    const formDataId = result?.data?.result?.[0]?.id;
    if (!(id() || formDataId)) {
      const createResult = createFormVertex(
        graph,
        setGraph,
        formStore().P.txnId,
        metaVertex()!.P.key,
        metaVertex()!.P.key === "Form" || metaVertex()!.P.key === "Page"
          ? { fns: `return { enabled: () => true }` }
          : {},
      );

      if (createResult.error) {
        setFormStore("error", createResult.error);
        return;
      }

      // we cant save the dataId again, because its used as a prop and giving some error
      // if (props.openedFormId) {
      //   mergeVertexProperties(0, props.openedFormId, graph, setGraph, {
      //     dataId: createResult.vertex!.id
      //   });
      // }
      // Link to parent page
      if (
        props.parentId &&
        (props.pageVertexName === "Template" ||
          props.pageVertexName === "Component")
      ) {
        const parentComponentMetaVertex = {
          id: "",
          IN: {},
          L: [],
          OUT: {},
          P:
            props.pageVertexName === "Template"
              ? parentTemplateAttribute
              : parentComponentAttribute,
        } as Vertex;
        setSelectionValue(
          formStore().P.txnId,
          createResult.vertex!,
          graph,
          setGraph,
          parentComponentMetaVertex,
          props.parentId,
        );
      }

      setFormStore("formDataId", createResult.vertex!.id);

      if (!id() && dataVertex()?.L[0] === "Form") {
        /*const layoutId = addFormInitialComponent(
          dataVertex(),
          graph,
          formStore().P.txnId,
          setGraph,
        );
        if (layoutId === -1) {
          setFormStore("error", "Adding component to layout failed");
          return;
        }*/
      }
    }
    if (formDataId) {
      setFormStore("formDataId", formDataId);

      createErrorVertex(formDataId);
    }
    if (!(props.parentId || props.txnId) && props.isDesignMode) {
      setPreventUndoAtOrBeforeIndex(formStore().P.txnId, graph, setGraph);
    }
    saveStepIndex(formStore().P.txnId, "initial", graph, setGraph);
    saveUndoPoint(formStore().P.txnId, graph, setGraph);

    if (!result) {
      return;
    }
    if (result.error) {
      setFormStore("error", result.error);
      return;
    }
    if (result.data?.graph) {
      setGraphData(graph, setGraph, result.data.graph);
    }
    if (result.componentData?.graph) {
      setGraphData(graph, setGraph, result.componentData.graph!);
    }
  }

  // Start loading data immediately
  onMount(() => {
    setFormStore("mounted", true);
  });

  createEffect(
    on(
      () => props.formId ?? "new",
      () => setFormStore("count", formStore().P.count + 1),
      { defer: true },
    ),
  );

  // createEffect(
  //   on(
  //     () => props.expression ?? "new",
  //     async () => {
  //       setFormStore("formMetaId", undefined);
  //       setFormStore("formDataId", undefined);
  //       await handleFormMetaData();
  //     },
  //     { defer: true },
  //   ),
  // );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  onCleanup(() => {
    // TODO: Remove all the meta
  });

  if (props.isDesignMode) {
    // Each open tab will be hide and have its own useBeforeLeave callback
    useBeforeLeave((e: BeforeLeaveEventArgs) => {
      if (props.dontConfirmExit) {
        // allow navigation
        return;
      }
      if (isDisabledTxn(formStore().P.txnId, graph)) {
        // allow navigation
        return;
      }

      // preventDefault to block immediately and prompt user async
      e.preventDefault();
      setTimeout(() => {
        setFormStore("discardPopup", true);
      }, 100);
      onConfirmExit = () => {
        // user wants to proceed anyway so retry with force=true
        e.retry(true);
      };
    });

    const beforeunload = (event: BeforeUnloadEvent) => {
      if (!isDisabledTxn(formStore().P.txnId, graph)) {
        event.preventDefault();
        event.returnValue = ""; // Chrome requires returnValue to be set
      }
    };
    if (!isServer) {
      makeEventListener(window, "beforeunload", beforeunload);
    }
  }

  const Content = () => (
    <PageView
      context={props.context}
      data={dataVertex()}
      hasFullPermission={permissions.full()}
      hasEditPermission={permissions.edit()}
      hasCreatePermission={permissions.create()}
      hasViewPermission={permissions.view()}
      id={id()}
      isNoPermissionCheck={isNoPermissionCheck()}
      metaVertex={metaVertex()!}
    />
  );
  const ContentSSR = () => {
    processResult(metaData());

    return <>
      {/* <Show when={props.enableSEO}>
        <Show when={metaVertex()?.P.seoTitle}>
          <SiteTitle>
            {getPageTitle(metaVertex()!)}
          </SiteTitle>
        </Show>
        <Show
          when={metaVertex()?.P.seoDescription}
        >
          <Meta
            content={
              metaVertex()?.P.seoDescription
            }
            name="description"
          />
        </Show>
      </Show> */}

      <Show when={formStore().P.error}>
        <SimpleWarningAlert message={formStore().P.error} />
      </Show>


      {/* <Show when={getGlobalStore(graph).P.isDevelopment}>
        <DebugPermissionInfo
          allConfiguredPermission={allConfiguredPermission()}
          authError={authError()}
          hasFullPermission={permissions.full() ?? false}
          hasEditPermission={permissions.edit() ?? false}
          hasCreatePermission={permissions.create() ?? false}
          hasViewPermission={permissions.view() ?? false}
          isNoPermissionCheck={isNoPermissionCheck()}
          metaVertexId={formStore().P.formMeta?.id}
          mounted={formStore().P.mounted}
          userRoles={getGlobalStore(graph).P.userRoles}
        />
      </Show> */}
      <Show
        fallback={<div>Data not found!</div>}
        // when={dataVertex()}
        when={
          metaData() &&
          (props.getFormData ? dataVertex() || !formStore().P.isFetching : true)
        }
      >
        <FormContext.Provider value={formStore().id}>
          <Switch>
            <Match
              when={
                !formStore().P.error &&
                // formStore().P.mounted &&
                metaVertex() &&
                (props.dataId && props.dataId !== "new"
                  ? dataVertex() || formStore().P.isFetching
                  : true)
              }
            >
              <Content />
              {/* <Show when={isNoPermissionCheck() && !props.hideSaveCancelButton}>
                <SaveCancelButton
                  closePopUp={props.closePopUp}
                  disabled={isDisabledTxn(formStore().P.txnId, graph)}
                />
              </Show> */}
            </Match>
          </Switch>
        </FormContext.Provider>
      </Show>
      <Show when={formStore().P.discardPopup}>
        <DialogWithButtons
          message="Discard unsaved changes - are you sure?"
          onCancel={() => setFormStore("discardPopup", false)}
          onConfirm={() => {
            revertTransaction(formStore().P.txnId, graph, setGraph);
            setFormStore("discardPopup", false);
            onConfirmExit();
          }}
          open={() => formStore().P.discardPopup}
          setOpen={setFormStore.bind(null, "discardPopup")}
          title="Discard changes"
        />
      </Show>
    </>
  }

  return (
    <Show keyed when={metaData() && formStore().P.count && (props.getFormData ? dataVertex() || !formStore().P.isFetching : true)}>
      <ContentSSR />
    </Show>
  );
}
