import { createSignal, onMount } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { FloatingFormDropdown } from "~/components/styled/dialog/FloatingFormDropdown";
import { KeyInputField } from "~/components/styled/dialog/KeyInputField";
import { useToast } from "~/components/styled/modal/Toast";
import { checkUniqueConstrains } from "~/cypher/mutate/validations/checkUniqueConstrains";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
  type PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import { openInNewInternalTab } from "~/features/page_designer/form_elements/pages/functions/openInNewInternalTab";
import {
  COMPONENT_PALETTE_CONFIG,
  resolvePaletteSaveCategoryId,
} from "~/features/page_designer/form_elements/components/componentPaletteConfig";
import {
  getPaletteServerError,
  isPaletteServerSuccess,
  moveContentToCategory,
} from "~/features/page_designer/form_elements/components/componentPaletteApi";
import { moveLayoutToComponent } from "~/features/page_designer/functions/layout/moveLayoutToComponent";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { As } from "~/components/As";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

function SaveCurrentPageCheckbox(props: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <As
      as="div"
      css={`return \`._id {
  margin-top: 0.75rem;
}\`;`}
    >
      <As
        as="label"
        css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  cursor: pointer;
}\`;`}
      >
        <As
          as="input"
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
          type="checkbox"
        />
        <As
          as="span"
          css={`return \`._id {
  font-size: 0.875rem;
}\`;`}
        >
          Save current page
        </As>
      </As>
    </As>
  );
}

export function SaveAsComponentMenu(
  props: Readonly<{
    item: Vertex;
    onClickOutside?: () => void;
    onClose: () => void;
    onMouseLeave?: () => void;
    parentRef: HTMLElement;
  }>,
) {
  let nameInputRef!: HTMLInputElement;
  const [graph, setGraph] = useGraph();
  const [componentKey, setComponentKey] = createSignal("");
  const [error, setError] = createSignal("");
  const [isSaving, setIsSaving] = createSignal(false);
  const [saveCurrentPage, setSaveCurrentPage] = createSignal(true);
  const { showSuccessToast, showWarningToast } = useToast();

  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    graph.vertexes[layoutStoreId]?.P as PageLayoutObject | undefined;
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const saveComponent = async () => {
    if (isSaving()) {
      return;
    }

    const pageTxnId = formStoreVertex()?.P.txnId;
    const formData = graph.vertexes[formStoreVertex()?.P.formDataId || ""];
    const shouldSaveCurrentPage = saveCurrentPage();

    if (shouldSaveCurrentPage && isNegative(formStoreVertex().P.formDataId)) {
      showWarningToast("Please Save Parent Page first.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const newFormTxnId = generateNewTxnId(graph, setGraph);
      const createResult = createFormVertex(
        graph,
        setGraph,
        newFormTxnId,
        "Component",
        {
          key: componentKey(),
        },
      );
      if (createResult.error || !createResult.vertex) {
        setError(createResult.error || "Failed to create component");
        return;
      }
      const dataVertex = createResult.vertex;

      const componentRefId = moveLayoutToComponent(
        props.item,
        dataVertex,
        componentKey(),
        newFormTxnId,
        pageTxnId,
        graph,
        setGraph,
        formData,
      );
      if (componentRefId === -1) {
        setError("Failed to move attributes to component");
        return;
      }

      const data = commitTxn(newFormTxnId, graph);
      if (!data) {
        showWarningToast("Internal Server Error");
        return;
      }

      await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);

      if (shouldSaveCurrentPage && pageTxnId) {
        const pageData = commitTxn(pageTxnId, graph);
        if (pageData) {
          await submitDataCall({ ...pageData }, graph, setGraph, pageTxnId);
        }
      }

      const componentVertex =
        findVertexByLabelAndUniqueId(
          graph,
          "Component",
          "key",
          componentKey(),
        ) ?? dataVertex;

      const categoryId = resolvePaletteSaveCategoryId(
        graph,
        layoutStore()?.selectedComponentCategoryId,
        COMPONENT_PALETTE_CONFIG,
      );

      if (categoryId) {
        const categoryResult = await moveContentToCategory(
          graph,
          setGraph,
          COMPONENT_PALETTE_CONFIG,
          [componentVertex.id],
          categoryId,
        );
        if (!isPaletteServerSuccess(categoryResult)) {
          showWarningToast(
            getPaletteServerError(
              categoryResult,
              "Failed to assign component to category",
            ),
          );
        }
      }

      openInNewInternalTab(layoutStoreId, componentVertex, graph, setGraph);
      showSuccessToast("Component Saved Successfully");
      props.onClose();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    const res = await checkUniqueConstrains({
      L: ["Component"],
      P: { key: componentKey() },
    } as unknown as Vertex);
    if (res.error) {
      setError(getErrorMessage(res));
      return;
    }
    await saveComponent();
  };

  onMount(() => {
    nameInputRef.focus();
  });

  return (
    <FloatingFormDropdown
      error={error()}
      footerButtonText="Save"
      footerDisabled={!componentKey().trim()}
      footerLoading={isSaving()}
      onClickOutside={props.onClickOutside}
      onFooterClick={() => void handleSave()}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
      subtitle="Component key must be unique. If the key already exists, you will be prompted to change it."
      title="Save As Component"
    >
      <KeyInputField
        id="componentKey"
        label="Component Key"
        onInput={setComponentKey}
        placeholder="New Component Key"
        ref={(el) => (nameInputRef = el)}
        value={componentKey()}
      />

      <SaveCurrentPageCheckbox
        checked={saveCurrentPage()}
        onChange={setSaveCurrentPage}
      />
    </FloatingFormDropdown>
  );
}
