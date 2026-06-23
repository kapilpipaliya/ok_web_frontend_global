import type { Vertex } from "~/lib/graph/type/vertex";
import {
  type Accessor,
  type Component,
  type Owner,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
  on,
  batch,
  untrack,
  For,
  createComponent,
  mergeProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import * as virtua from "~/components/virtua/src/core";
import * as floatingUI from "@floating-ui/dom";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { SetStoreFunction } from "solid-js/store";
import { createStore, reconcile } from "solid-js/store";
import type { ThemeContext, ColorMode } from "~/lib/styles/types/types";
import type { Navigator, useSearchParams, useParams } from "@solidjs/router";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { deleteTxnIdAndCreateNew } from "~/components/form/functions/deleteTxnIdAndCreateNew";
import { ensureData } from "~/components/form/functions/ensureData";
import { evalExpression } from "~/lib/expression_eval";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { removeTxnIdAndCreateNew } from "~/components/form/functions/removeTxnIdAndCreateNew";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revert/revertTransactionUpToIndex";
import { setError } from "~/components/form/functions/setError";
import { setGraphDataWithTransaction } from "~/lib/graph/mutate/core/setGraphDataWithTransaction";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { runWithOwnerFunction } from "~/components/form/dynamic_component/owner/runWithOwnerFunction";
import { runWithParentOwnerFunction } from "~/components/form/dynamic_component/owner/runWithParentOwnerFunction";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { saveUserSetting } from "~/lib/api/saveUserSetting";
import { postAPI } from "~/lib/api/general/postApi";
import { executeServerFunction } from "~/cypher/get/executeServerFunction";
import { executeNamedServerFunction } from "~/cypher/get/executeNamedServerFunction";
import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/store/getGlobalSettingVertex";
import { debounce } from "@solid-primitives/scheduled";
import * as focusTrap from "focus-trap";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { atom } from "~/lib/solid/atom";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { isVertex } from "~/lib/graph/mutate/core/vertex/isVertex";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import { newEdge } from "~/lib/graph/mutate/core/edge/newEdge";
import { klona } from "klona";
import { z } from "zod";
import { cloneVertexWithEdges } from "~/lib/graph/get/sync/entity/cloneVertexWithEdges";
import { findVertexByLabelAndPks, findVertexByLabelAndUniqueId, findVertexIdsByLabel } from "~/lib/graph/get/sync/entity/findVertex";
import { createDashboardPlatform } from "~/lib/dashboard";
import { findLoopTemplateMeta } from "~/components/form/dynamic_component/components/LoopChildrenRenderer";
import { createLoopRowRenderer } from "~/components/form/dynamic_component/functions/createLoopRowRenderer";
// Following Untitled-1 (11-21, 12-13): also import `combine`, `GroupDropIndicator`, `liveRegion`, `type Instruction`, and `triggerPostMoveFlash` non-directly (no direct imports).
// Only import drag-and-drop modules and related utilities on the client, using dynamic import assignment.

let draggable: any,
  dropTargetForElements: any,
  monitorForElements: any,
  dropTargetForExternal: any,
  monitorForExternal: any;
let setCustomNativeDragPreview: any;
let pointerOutsideOfPreview: any;
let centerUnderPointer: any;
let preserveOffsetOnSource: any;
let combine: any, GroupDropIndicator: any, liveRegion: any, triggerPostMoveFlash: any;
let attachInstruction: any, extractInstruction: any, DropIndicator: any;

if (typeof window !== "undefined") {
  // Only import drag-and-drop modules and related drag+drop utilities on the client
  import("./pragmaticElementAdapter").then(mod => {
    draggable = mod.draggable;
    dropTargetForElements = mod.dropTargetForElements;
    monitorForElements = mod.monitorForElements;
    setCustomNativeDragPreview = mod.setCustomNativeDragPreview;
    pointerOutsideOfPreview = mod.pointerOutsideOfPreview;
    centerUnderPointer = mod.centerUnderPointer;
    preserveOffsetOnSource = mod.preserveOffsetOnSource;
    dropTargetForExternal = mod.dropTargetForExternal;
    monitorForExternal = mod.monitorForExternal;
    combine = mod.combine;
    GroupDropIndicator = mod.GroupDropIndicator;
    DropIndicator = mod.DropIndicator;
    liveRegion = mod.liveRegion;
    triggerPostMoveFlash = mod.triggerPostMoveFlash;
    attachInstruction = mod.attachInstruction;
    extractInstruction = mod.extractInstruction;
  });
}

interface ToastFunctions {
  showErrorToast: (message: string) => void;
  showSuccessToast: (message: string) => void;
  showWarningToast: (message: string) => void;
}

interface ThemeToggleFunctions {
  toggleTheme: () => void;
  setColorMode: (mode: ColorMode) => void;
  resetTheme: () => void;
  currentMode: () => ColorMode;
}

/**
 * Create the base function arguments for dynamic components
 */
export function createFunctionArgumentBase(
  props: {
    data?: Vertex;
    meta: Vertex;
  },
  options: {
    formVertex: () => Vertex<FormStoreObject> | undefined;
    formId?: string;
    componentName: Accessor<string | Component | undefined>;
    isNoPermissionCheck: () => boolean;
    isViewMode: () => boolean | undefined;
    mounted: () => boolean | null;
    parentMeta: () => Vertex | undefined;
    ref: () => HTMLElement | null;
    setRef: (ref: HTMLElement | null) => void;
    updateValue: (value: unknown) => void;
    onChange: (value: unknown) => void;
    hasFullPermission: Accessor<boolean | null | undefined>;
    hasEditPermission: Accessor<boolean | null | undefined>;
    hasCreatePermission: Accessor<boolean | null | undefined>;
    hasViewPermission: Accessor<boolean | null | undefined>;
  },
  hooks: {
    graph: GraphInterface;
    setGraph: SetStoreFunction<GraphInterface>;
    toast: ToastFunctions;
    searchParams: ReturnType<typeof useSearchParams>[0];
    setSearchParams: ReturnType<typeof useSearchParams>[1];
    params: ReturnType<typeof useParams>;
    zIndex: number;
    navigate: Navigator;
    location: {
      pathname: string;
      search: string;
      hash: string;
      query: Record<string, string | string[] | undefined>;
      state: Readonly<Partial<unknown>> | null;
      key: string;
    };
    theme: ThemeContext;
    parentItems: [{ context: FunctionArgumentType }, unknown][];
    previewStore: { context: unknown };
    themeToggle: ThemeToggleFunctions;
    owner: Owner;
    parentRenderContext: () => { context: FunctionArgumentType } | undefined;
    functionProxy: Record<string, unknown>;
  },
) {
  return {
    clearAllErrors: () => {
      const errorVertexId = `${props.data?.id}-error`;
      replaceVertexProperties(
        0,
        errorVertexId,
        hooks.graph,
        hooks.setGraph,
        {},
      );
    },
    get componentName() {
      return options.componentName();
    },
    get context() {
      return hooks.previewStore.context;
    },
    get data() {
      return props.data;
    },
    get contextData() {
      return runWithOwnerFunction(hooks.owner, () => useDataContext() || {});
    },
    deleteTxnIdAndCreateNew: (txnId: number) => {
      return deleteTxnIdAndCreateNew(
        txnId,
        options.formId!,
        hooks.graph,
        hooks.setGraph,
      );
    },
    // on create save dataVertex is changed, so it's not available. so this will create new dataVertex again.
    ensureData: () => {
      return ensureData(
        props.data?.id,
        options.formId!,
        options.formVertex,
        hooks.graph,
        hooks.setGraph,
      );
    },
    error: (key?: string) => {
      const errorVertexId = `${props.data?.id}-error`;
      return hooks.graph.vertexes[errorVertexId]?.P[key ?? props.meta.P.key];
    },
    evalExpression,
    mergeVertexProperties,
    get fns() {
      return hooks.functionProxy;
    },
    formId: options.formId,
    get graph() {
      return hooks.graph;
    },
    get hasFullPermission() {
      return options.hasFullPermission();
    },
    get hasEditPermission() {
      return options.hasEditPermission();
    },
    get hasCreatePermission() {
      return options.hasCreatePermission();
    },
    get hasViewPermission() {
      return options.hasViewPermission();
    },
    get isNoPermissionCheck() {
      return options.isNoPermissionCheck();
    },
    get isViewMode() {
      return options.isViewMode();
    },
    get meta() {
      return props.meta;
    },
    mounted: options.mounted,
    navigate: hooks.navigate,
    location: hooks.location,
    onChange: options.onChange,
    owner: hooks.owner,
    parentItems: hooks.parentItems,
    get parentMeta() {
      return options.parentMeta();
    },
    parentRenderContext: hooks.parentRenderContext(),
    theme: hooks.theme,
    ref: options.ref,
    setRef: options.setRef,
    removeTxnIdAndCreateNew: (txnId: number) => {
      return removeTxnIdAndCreateNew(
        txnId,
        options.formId!,
        hooks.graph,
        hooks.setGraph,
      );
    },
    revertTransaction: (txnId: number) =>
      revertTransaction(txnId, hooks.graph, hooks.setGraph),
    revertTransactionUpToIndex: (txnId: number, txnIndex: number) =>
      revertTransactionUpToIndex(txnId, txnIndex, hooks.graph, hooks.setGraph),
    runWithOwner: (fn: () => void) => runWithOwnerFunction(hooks.owner, fn),
    runWithParentOwner: (fn: () => void) =>
      runWithParentOwnerFunction(hooks.parentRenderContext, fn),
    searchParams: hooks.searchParams,
    setError: (error: string | undefined, key?: string) => {
      const errorVertexId = `${props.data?.id}-error`;
      setError(
        errorVertexId,
        key ?? props.meta.P.key,
        error,
        hooks.graph,
        hooks.setGraph,
      );
    },
    get setGraph() {
      return hooks.setGraph;
    },
    setGraphData: (
      txnId: number,
      args: Parameters<typeof setGraphDataWithTransaction>[3],
      options: Parameters<typeof setGraphDataWithTransaction>[4],
    ) => {
      setGraphDataWithTransaction(
        txnId,
        hooks.graph,
        hooks.setGraph,
        args,
        options,
      );
    },
    setSearchParams: hooks.setSearchParams,
    get params() {
      return hooks.params;
    },
    showErrorToast: hooks.toast.showErrorToast,
    showSuccessToast: hooks.toast.showSuccessToast,
    showWarningToast: hooks.toast.showWarningToast,
    get txnId() {
      return options.formVertex()?.P.txnId ?? 0;
    },
    updateValue: options.updateValue,
    zIndex: hooks.zIndex,
    createSignal,
    createStore,
    reconcile,
    createMemo,
    batch,
    createEffect,
    onCleanup,
    on,
    untrack,
    // Theme toggle functions from useThemeToggle hook
    toggleTheme: hooks.themeToggle.toggleTheme,
    setColorMode: hooks.themeToggle.setColorMode,
    resetTheme: hooks.themeToggle.resetTheme,
    currentMode: hooks.themeToggle.currentMode,
    // User settings getter and setter
    get globalSetting() {
      return getGlobalSettingVertex(hooks.graph);
    },
    get userSetting() {
      const userSettingId = getGlobalStore(hooks.graph).P.userSettingId;
      return userSettingId ? hooks.graph.vertexes[userSettingId]?.P : undefined;
    },
    saveUserSetting: (settings: Record<string, unknown>) => {
      return saveUserSetting(settings, hooks.graph, hooks.setGraph);
    },
    // Current user vertex getter
    get user() {
      return getMemberVertex(hooks.graph);
    },
    executeServerFunction,
    executeNamedServerFunction,
    postAPI,
    /** Zod — same library as server/schema helpers; safe for use in `props`, `fns`, `css` bodies. */
    z,
    /** Dashboard platform contracts (interaction, query AST, cache, invalidation). */
    dashboardPlatform: createDashboardPlatform(),
    floatingUI,
    /** Virtua core virtual-scroll utilities (`createVirtualStore`, `createScroller`, etc.). */
    virtua,
    debounce,
    focusTrap,
    KeepAwake,
    atom,
    // Vertex utilities
    newVertex,
    generateNewVertexId,
    generateNewTxnId,
    addNewVertex,
    deleteVertex,
    isVertex,
    replaceVertexProperties,
    addNewEdge,
    deleteEdge,
    newEdge,
    cloneVertexWithEdges,

    // setGraphData,
    klona,
    
    // Graph query helpers using existing functions
    findVertexByLabelAndPks,
    findVertexByLabelAndUniqueId,
    findVertexIdsByLabel,
    
    // Pragmatic drag and drop - getters so async client import is visible after fns closure creation
    get draggable() {
      return draggable;
    },
    get dropTargetForElements() {
      return dropTargetForElements;
    },
    get monitorForElements() {
      return monitorForElements;
    },
    get dropTargetForExternal() {
      return dropTargetForExternal;
    },
    get monitorForExternal() {
      return monitorForExternal;
    },
    get setCustomNativeDragPreview() {
      return setCustomNativeDragPreview;
    },
    get pointerOutsideOfPreview() {
      return pointerOutsideOfPreview;
    },
    get centerUnderPointer() {
      return centerUnderPointer;
    },
    get preserveOffsetOnSource() {
      return preserveOffsetOnSource;
    },
    get combine() {
      return combine;
    },
    get GroupDropIndicator() {
      return GroupDropIndicator;
    },
    get DropIndicator() {
      return DropIndicator;
    },
    get liveRegion() {
      return liveRegion;
    },
    get triggerPostMoveFlash() {
      return triggerPostMoveFlash;
    },
    get attachInstruction() {
      return attachInstruction;
    },
    get extractInstruction() {
      return extractInstruction;
    },
    createLoopRowRenderer: (
      mapContextValue: (rowData: unknown, index: Accessor<number>) => unknown,
    ) => {
      const loopMeta = findLoopTemplateMeta(
        hooks.graph,
        hooks.setGraph,
        props.meta,
      );
      if (!loopMeta) {
        return () => null;
      }
      return createLoopRowRenderer({
        loopMeta,
        data: props.data,
        isNoPermissionCheck: options.isNoPermissionCheck?.(),
        mapContextValue,
      });
    },
  } as Omit<FunctionArgumentType, "parentValue" | "projections" | "value">;
}
