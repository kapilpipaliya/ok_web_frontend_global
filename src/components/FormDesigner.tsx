import { AbstractSingleForm } from "./Form";
import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, createUniqueId, onCleanup, Show } from "solid-js";
import { getPkForCollection, PageContext, Record } from "../lib/Record";
import { PageItemRender } from "./input/GenaricField";
import TreeView, { Item as dxTreeViewItem } from "devextreme/ui/tree_view";
import { Vertex } from "../lib/graph";
import { getChildVertex, getToEdge } from "../lib/Traverse";
import { stringify } from "yaml";
import { klona } from "klona";
import { findVertexByLabelAndUniqueId } from "../lib/Vertex";
import { AttrsTableData } from "./api";
import { Navigator } from "@solidjs/router/dist/types";
import { importNavigation } from "../pages/BackupRestore";

export const FormDesigner = () => {
 const params = useParams();
 return (
  <div>
   hello
   <AbstractSingleForm formId={"Coll"} id={params.id} config={{}} />
  </div>
 );
};

export const PageDesigner = () => {
 const params = useParams();
 const config = {} as { record: Record };
 const [count, setCount] = createSignal(1);
 const rerender = () => {
  setCount(prev=>prev+1);
 }
 const Preview = () => {
  return <PageItemRender metaVertex={config.record.vertex}/>
 }
 return (
  <div class="flex">
   <div class="border:1|solid|blue-60 p:10 m:5">
    <AbstractSingleForm
     formId={"Page2"}
     id={params.id}
     config={config}
     // TODO: add dry option
    />
   </div>

   <div class="border:1|solid|blue-60 p:10 m:5 min-w:300">

   <button type={"button"} onClick={rerender}>Run</button>
    <PageContext.Provider value={{ events: {  } }}>
     <Show when={count() && config.record.vertex && count()} keyed>
      <Preview/>
     </Show>
    </PageContext.Provider>
   </div>

  </div>
 );
};

/*
TODO:
1. make inward selectbox and tagbox working
2. make import working too.
 */
export const NavDesigner = () => {
 const params = useParams();
 const config = {} as { record: Record };
 const [count, setCount] = createSignal(1);
 const [previewCode, setPreviewCode] = createSignal(false);
 const navigate = useNavigate();
 const rerender = () => {
  setCount(prev => prev + 1);
 };
 const PreviewCode = () => {
  const getChildren = (meta: Vertex, vertex: Vertex, result: {
   [key: string]: any
  }) => {
   const metaVertexes = config.record.getSublistRowsForType("MetaAttr", meta);
   // const props = meta.P.props || {};

   const selectMetaVertexes = metaVertexes.filter(meta => ["SelectBox", "TagBox"].includes(meta.P.component));
   const tableMetaVertexes = metaVertexes.filter(meta => ["Table"].includes(meta.P.component));


   for (const metaVertex of selectMetaVertexes) {
    const metaProps = metaVertex.P.props || {};

    if (metaProps.inward) {
     // result['IN'] = {} as {[EdgeType: string]: {[primaryKey: string]: any}[]};

    } else {
     const type = getToEdge(metaVertex, vertex);
     // also can use selectedValue function;
     const childVertexes = config.record.getSublistRows(metaVertex, vertex);

     for (const v of childVertexes) {
      // getCollFromCollectionExpr function is not available means Cant find a collection from meta,
      // so get Primary Key from Vertex itself.
      const label = v.L[0];
      if (AttrsTableData[label]) {
       const pksResult = {} as { [primaryKey: string]: any };
       pksResult["name"] = v.P["name"];
       if (!result["OUT"]) {
        result["OUT"] = {} as {
         [EdgeType: string]: { [primaryKey: string]: any }[]
        };
       }
       result["OUT"][type] = [pksResult];
       // getChildren(metaVertex, v, pksResult);
      } else {
       const collVertex = findVertexByLabelAndUniqueId("Coll", "name", label);
       if (!collVertex) {
        alert(`Collection not defined: ${label}`);
        continue;
       }
       const pks = getPkForCollection(collVertex);

       const pksResult = {} as { [primaryKey: string]: any };
       for (const pk of pks) {
        pksResult[pk] = v.P[pk];
       }
       if (pks.length === 0) {
        pksResult["name"] = v.P["name"];
       }

       if (!result["OUT"]) {
        result["OUT"] = {} as {
         [EdgeType: string]: { [primaryKey: string]: any }[]
        };
       }

       if (!result["OUT"][type]) {
        result["OUT"][type] = [pksResult];
       } else {
        result["OUT"][type].push(pksResult);
       }
       // getChildren(metaVertex, v, pksResult);
      }

     }
    }
   }
   for (const metaVertex of tableMetaVertexes) {
    const metaProps = metaVertex.P.props || {};

    if (metaProps.inward) {
     // not possible now
    } else {
     const type = getToEdge(metaVertex, vertex);
     const childVertexes = config.record.getSublistRows(metaVertex, vertex);


     const out = childVertexes.map(v => getChildren(metaVertex, v, {
      ...klona(v),
      L: v.L[0],
      IN: undefined,
      OUT: undefined,
      id: undefined,
      D: undefined
     }));
     if (out.length > 0) {
      if (!result["OUT"]) {
       result["OUT"] = { [type]: out } as {
        [EdgeType: string]: { [primaryKey: string]: any }[]
       };
      } else
       result["OUT"][type] = out;
     }
    }
   }

   return result;
  };

  const result = getChildren(config.record.metaVertex, config.record.vertex, {
   ...klona(config.record.vertex),
   L: config.record.vertex.L[0],
   IN: undefined,
   OUT: undefined,
   id: undefined,
   D: undefined
  });

  console.log(stringify(result));


  // export:
  return <pre>{stringify(result)}</pre>;
 };

 const [importCode, setImportCode] = createSignal("");

 const importCodeFn = () => {

  importNavigation(importCode(), config.record);


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
    <textarea value={importCode()}
              onChange={e => setImportCode(e.target.value)} />
    <button type="button" onClick={importCodeFn}>Import Code</button>

   </div>

   <div class="border:1|solid|blue-60 p:10 m:5 min-w:300">
    <button type={"button"} onClick={rerender}>Run</button>
    <button type={"button"}
            onClick={_ => setPreviewCode(prev => !prev)}>Preview
    </button>
    <br />
    <Show when={previewCode()}>
     <PreviewCode />
    </Show>
    <Show when={count() && config.record.vertex && count()} keyed>
     <div
      ref={el => renderTreeFromGraph(el, config.record, navigate)}
     ></div>
    </Show>
   </div>
  </div>
 );
};

export const renderTreeFromGraph = (el: HTMLDivElement, record: Record, navigate: Navigator) => {
 // !!!TODO!!!: This code can we written in the code itself
 const getChildren = (meta: Vertex, vertex: Vertex) => {
  const result = [] as dxTreeViewItem[];

  const metaVertexes = record.getSublistRowsForType("MetaAttr", meta);
  const attrMeta = metaVertexes.find(meta => meta.P.name === "Attr");
  if (!attrMeta) return result;
  const children = record.getSublistRows(attrMeta, vertex);
  for (const child of children) {
   const name = child.P.name;
   const func = child.P.func;
   const expanded = child.P.expanded;
   const navItem = {} as dxTreeViewItem;
   if (func === "Table") {
    const collVertex = getChildVertex(["$0Coll"], child).vertex;
    // TODO: Check Permission
    if (collVertex) {
     // TODO: Check Permission
     // add to result if its allowed
     navItem.name = name;
     navItem.href = `/admin/${collVertex.P.name}`;
    } else {
     const formVertex = getChildVertex(["$0Form"], child).vertex;
     if (formVertex) {
      // TODO: Check Permission
      // add to result if its allowed
      navItem.name = name;
      navItem.href = `/admin/${formVertex.P.name}`;
     } else {
      const url = child.P.url;
      navItem.name = name;
      navItem.href = url;
     }
    }
   } else {
    const url = child.P.url;
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

 const instance = new TreeView(el, {
  dataSource: navigation,
  dataStructure: "tree",
  keyExpr: "id",
  displayExpr: "name",
  itemsExpr: "children",
  width: 200,
  onItemClick(e) {
   if (e.itemData?.href) navigate(e.itemData.href, { resolve: false });
  }
 });
 onCleanup(() => instance.dispose());
}