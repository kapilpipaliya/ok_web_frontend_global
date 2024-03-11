import { useNavigate, useParams } from "@solidjs/router";
import { Show, createSignal, createUniqueId, onCleanup } from "solid-js";
import { PageItemRender } from "../components/input/GenaricField";
import { getExportCode } from "../lib/Record";
import { Record } from "../lib/Utils";
import { PageContext } from "../lib/Utils";
// Comment This Lines in web build
import { Navigator } from "@solidjs/router/dist/types";
import { createStore } from "solid-js/store";
import { stringify } from "yaml";
import { AbstractSingleForm } from "../components/DynamicForm";
import { importRecordWithYAMLSchema } from "../lib/Import";
import { getChildVertex } from "../lib/Utils";
import { Vertex } from "../lib/graph";
import { showNav } from "../signals/common";

/*
  Tasks:
  Check if this component support custom components.
  Check if we can directly use the the vertexes, or can use some proxies so we not need intermediate transformations
  https://js.devexpress.com/Demos/WidgetsGallery/Demo/TreeView/DragAndDropHierarchicalDataStructure/jQuery/Light/
*/
export const PageDesigner = () => {
  const params = useParams();
  const config = createStore({} as { record: Record });
  const [count, setCount] = createSignal(1);
  const rerender = () => {
    setCount((prev) => prev + 1);
  };
  const Preview = () => {
    return <PageItemRender metaVertex={config[0].record.vertex} />;
  };
  return (
    <div class="flex">
      <div class="border:1|solid|blue-60 p:10 m:5">
        <AbstractSingleForm
          formId={"Page"}
          id={params.id}
          config={config}
          // TODO: add dry option
        />
      </div>

      <div class="border:1|solid|blue-60 p:10 m:5 min-w:400">
        <div class={"text:center mb:12"} onClick={rerender}>
          Preview
        </div>
        <PageContext.Provider value={{ events: {} }}>
          <Show when={count() && config[0].record?.vertex && count()} keyed>
            <Preview />
          </Show>
        </PageContext.Provider>
      </div>
    </div>
  );
};

/*
TODO:
Instead of this use Page Builder
 */
export const NavDesigner = () => {
  const params = useParams();
  const config = createStore({} as { record: Record });
  const [count, setCount] = createSignal(1);
  const [previewCode, setPreviewCode] = createSignal(false);
  const navigate = useNavigate();
  const rerender = () => {
    setCount((prev) => prev + 1);
  };
  const PreviewCode = () => {
    return <pre>{stringify(getExportCode(config[0].record))}</pre>;
  };

  const [importCode, setImportCode] = createSignal("");

  const importCodeFn = () => {
    importRecordWithYAMLSchema(importCode(), config[0].record);
  };
  return (
    <div class="flex">
      <div class="border:1|solid|blue-60 p:10 m:5">
        <AbstractSingleForm
          formId={"Nav"}
          id={params.id}
          config={config}
          // TODO: add dry option
        />
        <textarea value={importCode()} onChange={(e) => setImportCode(e.target.value)} />
        <button type="button" onClick={importCodeFn}>
          Import Code
        </button>
      </div>

      <div class="border:1|solid|blue-60 p:10 m:5 min-w:300">
        <button type={"button"} onClick={rerender}>
          Run
        </button>
        <button type={"button"} onClick={(_) => setPreviewCode((prev) => !prev)}>
          Preview
        </button>
        <br />
        <Show when={previewCode()}>
          <PreviewCode />
        </Show>
        <Show when={count() && config[0].record?.vertex && count()} keyed>
          <div
            // ref={(el) => renderNavTreeFromGraph(el, config[0].record, navigate)}
          ></div>
        </Show>
      </div>
    </div>
  );
};

export const renderNavTreeFromGraph = (el: HTMLDivElement, record: Record, navigate: Navigator) => {
  // !!!TODO!!!: This code can we written in the code itself
  const getChildren = (meta: Vertex, vertex: Vertex) => {
    const result = [];

    const metaVertexes = record.getSublistRowsForType("MetaAttr", meta);
    const attrMeta = metaVertexes.find((meta) => meta.P.name === "Attr");

    if (!attrMeta) return result;

    const children = record.getSublistRows(attrMeta, vertex);

    for (const child of children) {
      const name = child.P.name;
      const func = child.P.func;
      const expanded = child.P.expanded;
      const navItem = {};

      if (func === "Table") {
        const collVertex = getChildVertex(["$0Coll"], child).vertex;
        // TODO: Check Permission
        if (collVertex) {
          // TODO: Check Permission
          // add to result if its allowed
          navItem.name = name;
          navItem.href = (showNav() ? "/nav" : "") + `/admin/${collVertex.P.name}`;
        } else {
          const formVertex = getChildVertex(["$0Form"], child).vertex;
          if (formVertex) {
            // TODO: Check Permission
            // add to result if its allowed
            navItem.name = name;
            navItem.href = `${showNav() ? "/nav" : ""}/admin/${formVertex.P.name}`;
          } else {
            const url = (showNav() ? "/nav" : "") + child.P.url;
            navItem.name = name;
            navItem.href = url;
          }
        }
      } else {
        const url = (showNav() ? "/nav" : "") + child.P.url;
        navItem.name = name;
        navItem.href = url;
      }
      navItem.expanded = expanded;
      navItem.id = createUniqueId();

      navItem.children = getChildren(attrMeta!, child);

      result.push(navItem);
    }
    return result;
  };

  const navigation = getChildren(record.metaVertex, record.vertex);

  console.log(navigation);

  // const instance = new TreeView(el, {
  //   dataSource: navigation,
  //   dataStructure: "tree",
  //   keyExpr: "id",
  //   displayExpr: "name",
  //   itemsExpr: "children",
  //   width: 200,
  //   searchEnabled: true,
  //   onItemClick(e) {
  //     if (e.itemData?.href) navigate(e.itemData.href, { resolve: false });
  //   },
  // });

  // onCleanup(() => instance.dispose());
  // return instance;
};
