import { setSelectionValue } from "~/cypher_api/components/input/SelectInputField";

import { getChildVertexMGCall, getParentVertexMGCall } from "~/cypher_api/lib/data/traverse";


import { SetStoreFunction, Store } from "solid-js/store";
import { DBConnection } from "~/cypher_api/functions/dbs";
import { GraphInterface } from "~/lib/graph/graph";
import { getNewTxnId } from "~/lib/graph/transaction";

let componentPropsInputRef: HTMLInputElement;

const insertAttributes = async (
  txnId: Id,
  parentVertex: Node,
  collectionMetaData: FormMetaData,
) => {
  const collectionAttributes = collectionMetaData["attributes"];
  if (!collectionAttributes) return;

  for (const attribute of collectionAttributes) {
    const name = attribute.name;
    const displayName = attribute.displayName;
    let component = attribute.component;
    if (attribute.props && !component) {
      component = "TextBox";
    }
    // const description = attribute.description;
    const rowResult = newRow(txnId, parentVertex, "Attr", "Attr", {
      name,
      displayName,
    });

    const setDataType = (rowVertex: Node, dataType: string) => {
      const dataTypeVertex = findVertexByLabelAndUniqueId(
        graph,
        "DataType",
        IdAttr,
        dataType,
      );
      if (!dataTypeVertex) {
        console.log("dataType not found", dataType);
      } else {
        setSelectionValue(
          txnId,
          rowVertex,
          { P: { [IdAttr]: "DataType" } } as unknown as Node,
          dataTypeVertex.id,
        );
        return dataTypeVertex;
      }
      return;
    };

    const setComponent = (rowVertex: Node, component: string) => {
      const compVertex = findVertexByLabelAndUniqueId(
        graph,
        "Comp",
        IdAttr,
        component,
      );
      if (!compVertex) {
        console.log("component not found", component);
      } else {
        setSelectionValue(
          txnId,
          rowVertex,
          { P: { [IdAttr]: "Comp" } } as unknown as Node,
          compVertex.id,
        );
        return compVertex;
      }
      return;
    };

    let dataTypeVertex: Node | undefined;
    if (attribute.dataType) {
      dataTypeVertex = setDataType(
        graph.vertexes[rowResult.vertexId!],
        attribute.dataType,
      );
    }

    if (component && (component !== "TextBox" || attribute.props)) {
      const compVertex = setComponent(
        graph.vertexes[rowResult.vertexId!],
        component,
      );
      if (compVertex && !dataTypeVertex) {
        const dataTypeDefault = await getChildVertexMGCall(["$0Default"], compVertex);
        if (dataTypeDefault.error) {
          console.warn(`Component dataType not configured ${component}`);
        } else {
          dataTypeVertex = setDataType(
            graph.vertexes[rowResult.vertexId!],
            dataTypeDefault.vertex!.P[IdAttr],
          );
        }
      }

      if (compVertex && attribute.props) {
        for (const property in attribute.props) {
          const props = getCompPropsMap(compVertex);
          if (props[property]) {
            const rowResult = newRow(
              txnId,
              parentVertex,
              "AttrProp",
              "AttrProp",
              { value: attribute.props[property] },
            );
            if (!rowResult.error) {
              setSelectionValue(
                txnId,
                graph.vertexes[rowResult.vertexId!],
                { P: { [IdAttr]: "Name" } } as unknown as Node,
                props[property].id,
              );
            }
          }
        }
      }
    }
  }
};
// @ts-ignore
const importCollections = () => {
  const file = componentPropsInputRef!.files![0];

  if (file) {
    file.text().then(async (jsonText) => {
      const json = JSON.parse(jsonText);
      let txnId = getNewTxnId(graph, setGraph); // Note txnId 0 not working
      for (const collectionId in json) {
        const collection = json[collectionId];
        const name = collection["name"] as string;
        const title = collection["title"] as string;

        const parentVertexId = getNewGraphId();
        addNewVertex(
          txnId,
          newVertex(parentVertexId, ["Coll"], { name, title }),
        );
        insertAttributes(txnId, graph.vertexes[parentVertexId], collection);
      }
      // commitTxn(txnId, Ws);
      console.error("inserting properties finished.");
    });
  }
};

const makeASampleForm = async () => {
  // get all the fields
  const vertexId = getNewGraphId();
  const txnId = getNewTxnId(graph, setGraph);
  addNewVertex(
    txnId,
    newVertex(vertexId, ["Coll"], {
      [IdAttr]: "TestForm",
      title: "Test Form",
      table: true,
    }),
  );
  const existingVertex = graph.vertexes[vertexId];
  for (const compVertexId of graph.vertexLabelIdMap["Comp"]) {
    const componentVertex = graph.vertexes[compVertexId];
    const componentName = componentVertex.P[IdAttr];
    if (
      [
        "DropDownBox",
        "Bullet",
        "CircularGauge",
        "LinearGauge",
        "ProgressBar",
      ].includes(componentName)
    )
      continue;
    const newRow1 = newRow(txnId, existingVertex, "Attr");
    replaceVertexProperties(txnId, newRow1.vertexId!, {
      [IdAttr]: getId(componentName),
      displayName: componentName,
    });
    const dataType = await getParentVertexMGCall(["DataType$0"], componentVertex);
    if (!dataType.error) {
      // set component dataType and component
      setSelectionValue(
        txnId,
        graph.vertexes[newRow1.vertexId!],
        // @ts-ignore
        { P: { [IdAttr]: "dataType" } } as Node,
        dataType.vertex!.id,
      );
      setSelectionValue(
        txnId,
        graph.vertexes[newRow1.vertexId!],
        // @ts-ignore
        { P: { [IdAttr]: "comp" } } as Node,
        compVertexId,
      );
    }
  }
  // commitTxn(txnId, Ws);
};

// @ts-ignore
export async function importAllCSV(dbConn: DBConnection,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>) {
  const form = await getFormMetaData(dbConn, "Import");
  if (form.error) return form.error;
  const record = new Record({ dbConn, graph, setGraph });
  const createResult = record.create(form.form![IdAttr]);
  record.createMeta(form.form!);
  if (createResult.error) return createResult.error;

  // 1. import dataTypes
  updateImportRecord("dataType", record, false);
  record.mergeFieldValues({
    csv: `name
Null
String
Boolean
Integer
Float
List
Map
Duration
Date
LocalTime
LocalDateTime
->
=>`,
  });
  await onDataDirectoryImportClick(record);
  // 2. Import components
  updateImportRecord("component", record, false);
  record.mergeFieldValues({
    csv: `name\tdataType\tparent\tcategory\tchild
ActionSheet\t\t\tAction\tTRUE
Button\t\t\tAction\t
ContextMenu\t\t\tAction\tTRUE
DropDownButton\t\t\tAction\t
Resizable\t\t\tAction\tTRUE
SpeedDialAction\t\t\tAction\t
Bullet\tInteger\t\tChart\t
Chart\t\t\tChart\t
Funnel\t\t\tChart\t
PieChart\t\t\tChart\t
PolarChart\t\t\tChart\t
Sankey\t\t\tChart\t
SparkLine\t\t\tChart\t
TreeMap\t\t\tChart\tTRUE
PopOver\t\t\tDialog\t
Popup\t\t\tDialog\t
Toast\t\t\tDialog\t
Tooltip\t\t\tDialog\t
Autocomplete\tString\t\tForm\t
ButtonGroup\t\t\tForm\tTRUE
Calendar\tInteger\t\tForm\t
CheckBox\tBoolean\t\tForm\t
ColorBox\tString\t\tForm\t
DateBox\tDate\t\tForm\t
DateRangeBox\t\t\tForm\t
DateTimeBox\tLocalDateTime\tDateBox\tForm\t
Diagram\t\t\tForm\t
DropDownBox\tList\t\tForm\t
FieldSetLabelLeft\t\t\tForm\tTRUE
FileManager\t\t\tForm\t
FileUploader\tList\t\tForm\t
FilterBuilder\tList\t\tForm\t
Float\tFloat\tNumberBox\tForm\t
Form\t\t\tForm\tTRUE
Gantt\t\t\tForm\t
HtmlEditor\tString\t\tForm\t
Int\tInteger\tNumberBox\tForm\t
Lookup\t\t\tForm\t
NumberBox\tFloat\t\tForm\t
RadioGroup\tList\t\tForm\t
RangeSelector\t\t\tForm\t
RangeSlider\t\t\tForm\t
Scheduler\t\t\tForm\tTRUE
Slider\tFloat\t\tForm\t
Sortable\t\t\tForm\tTRUE
Switch\tBoolean\t\tForm\t
Table\tList\t\tForm\t
TextArea\tString\t\tForm\t
TextBox\tString\t\tForm\t
BarGauge\t\t\tGauge\t
CircularGauge\tInteger\t\tGauge\t
LinearGauge\tFloat\t\tGauge\t
DataGrid\t\t\tGrid\tTRUE
PivotGrid\t\t\tGrid\t
TreeList\t\t\tGrid\tTRUE
SelectBox\t->\t\tJoin\t
TagBox\t=>\t\tJoin\t
Gallery\t\t\tList\tTRUE
List\t\t\tList\tTRUE
TileView\t\t\tList\tTRUE
Map\t\t\tMap\t
VectorMap\t\t\tMap\tTRUE
Accordion\t\t\tNavigation\tTRUE
Drawer\t\t\tNavigation\tTRUE
Menu\t\t\tNavigation\tTRUE
MultiView\t\t\tNavigation\t
TabPanel\t\t\tNavigation\tTRUE
Tabs\t\t\tNavigation\tTRUE
Toolbar\t\t\tNavigation\tTRUE
TreeView\t\t\tNavigation\tTRUE
LoadIndicator\t\t\tNotification\t
LoadPanel\t\t\tNotification\t
ProgressBar\tFloat\t\tNotification\t
Box\t\t\tView\tTRUE
ScrollView\t\t\tView\t`,
  });
  await onDataDirectoryImportClick(record);
  // 3. Import dataTypeDefault
  updateImportRecord("dataTypeDefault", record, false);
  record.mergeFieldValues({
    csv: `name\tdefault
String\tTextBox
Boolean\tCheckBox
Integer\tInt
Float\tFloat
List\tTextArea
Map\tTextArea
Duration\tDateBox
Date\tDateBox
LocalTime\tDateTimeBox
LocalDateTime\tDateBox
->\tSelectBox
=>\tTagBox`,
  });
  await onDataDirectoryImportClick(record);

  //
  updateImportRecord("user", record, false);
  record.mergeFieldValues({
    csv: `name\temail\tpass\trole
Test1\ttest1@test.com\tTest@123\tAdmin
Test2\ttest2@test.com\tTest@123\tUser`,
  });
  await onDataDirectoryImportClick(record);

  updateImportRecord("role", record, false);
  record.mergeFieldValues({
    csv: `name
Admin
User`,
  });
  await onDataDirectoryImportClick(record);

  updateImportRecord("perm", record, false);
  record.mergeFieldValues({
    csv: `name
insert
edit
view
delete`,
  });
  await onDataDirectoryImportClick(record);
}
const importMainNavigation = (
  dbConn: DBConnection,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) => {
  const record = new Record({ dbConn, graph, setGraph });
  record.create("Nav", {});
  record.createMeta(AttrsAdminTableData["Nav"]);
  importRecordWithYAMLSchema(
    `L: Nav
P:
  title: Main
  name: main
OUT:
  NavAttr:
    - L: NavAttr
      P:
        name: Home
        url: /admin/
    - L: NavAttr
      P:
        name: Base
        expanded: false
      OUT:
        NavAttr:
          - L: NavAttr
            P:
              name: DataTypes
              url: /admin/DataType
          - L: NavAttr
            P:
              name: Components Category
              url: /admin/CompCategory
          - L: NavAttr
            P:
              name: Components
              url: /admin/Comp
          - L: NavAttr
            P:
              name: Import
              url: /admin/SimpleImport
          - L: NavAttr
            P:
              name: Backup & Restore
              url: /admin/backup_restore
    - L: NavAttr
      P:
        name: Auth
        expanded: false
      OUT:
        NavAttr:
          - L: NavAttr
            P:
              name: Users
              url: /admin/User
          - L: NavAttr
            P:
              name: Roles
              url: /admin/Role
          - L: NavAttr
            P:
              name: Permissions
              url: /admin/Perm
    - L: NavAttr
      P:
        name: Customization
        expanded: true
      OUT:
        NavAttr:
          - L: NavAttr
            P:
              name: Collections Category
              url: /admin/CollCategory
          - L: NavAttr
            P:
              name: Collections
              url: /admin/Coll
#          - L: NavAttr
#            P:
#              name: Forms
#              url: /admin/Form
          - L: NavAttr
            P:
              name: Pages
              url: /admin/Page
          - L: NavAttr
            P:
              name: Dashboards
              url: /admin/Dashboard
    - L: NavAttr
      P:
        name: Dashboards
        url: /admin/dashboards
`,
    record,
  );
  record.commitTxn();
  console.error("Imported Navigation");
};

// Hack to remount the component
