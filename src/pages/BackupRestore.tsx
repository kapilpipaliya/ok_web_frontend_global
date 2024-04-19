import {batch, JSX, useContext} from "solid-js";
import {
    backupToIndexDB,
    backupToJson,
    commitTxn,
    getNewGraphId,
    getNewTxnId,
    GraphContext,
    Id,
    IdAttr,
    resetDatabase,
    restoreFromIndexDB,
    restoreFromJson,
    Vertex,
} from "~/lib/graph";
import {A} from "@solidjs/router";
import {
    addNewVertex,
    findVertexByLabelAndUniqueId,
    mergeVertexProperties,
    newVertex,
    replaceVertexProperties
} from "~/lib/Vertex";
import {WsContext} from "~/utils/ws_events_dispatcher";
import {getParentVertex, getChildVertex, getId, newRow, Record, APP_BASE_URL} from "~/lib/Utils";
import {getCompPropsMap, getFormMetaData} from "~/lib/Record";
import {importRecordWithYAMLSchema, onDataDirectoryImportClick, updateImportRecord} from "~/lib/Import";
import {fileDownloader} from "~/utils/dom_utils";
import {Field, NsMetaJson} from "./NSMetaDataType";
import {setSelectionValue} from "~/components/input/SelectionUtils";
import {AttrsAdminTableData} from "~/lib/apiAdmin";
import {FormMetaData} from "~/lib/Type";

export const BackupRestore = () => {
    const {Ws} = useContext(WsContext);
    const [graph, setGraph] = useContext(GraphContext)!;
    let fileInputRef: HTMLInputElement;
    let componentPropsInputRef: HTMLInputElement;
    let importNSDataInputRef: HTMLInputElement;
    const downloadJson = () => {
        const json = backupToJson(graph);
        fileDownloader({
            data: JSON.stringify(json),
            title: "Download Json",
            filename: "graph.json"
        });
    };
    const backupToIndexDB_ = () => {
        backupToIndexDB(graph).then(() => alert("graph is stored in indexDB"));
    };
    const restoreFromFile = () => {
        const file = fileInputRef!.files![0];

        if (file) {
            file.text().then((json) => {
                restoreFromJson(JSON.parse(json), setGraph);
            });
        }
    };
    const insertAttributes = (txnId: Id, parentVertex: Vertex, collectionMetaData: FormMetaData) => {

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
            const rowResult = newRow(
                graph,
                setGraph,
                txnId,
                parentVertex,
                "Attr",
                "Attr",
                {name, displayName}
            );

            const setDataType = (rowVertex: Vertex, dataType: string) => {
                const dataTypeVertex = findVertexByLabelAndUniqueId("DataType", IdAttr, dataType, graph);
                if (!dataTypeVertex) {
                    console.log("dataType not found", dataType);
                } else {
                    setSelectionValue(
                        txnId,
                        rowVertex, graph, setGraph,
                        {P: {[IdAttr]: "DataType"}} as unknown as Vertex,
                        dataTypeVertex.id,
                    );
                    return dataTypeVertex;
                }
                return;
            }

            const setComponent = (rowVertex: Vertex, component: string) => {
                const compVertex = findVertexByLabelAndUniqueId("Comp", IdAttr, component, graph);
                if (!compVertex) {
                    console.log("component not found", component);
                } else {
                    setSelectionValue(
                        txnId,
                        rowVertex, graph, setGraph,
                        {P: {[IdAttr]: "Comp"}} as unknown as Vertex,
                        compVertex.id,
                    );
                    return compVertex;
                }
                return;
            }

            let dataTypeVertex: Vertex | undefined;
            if (attribute.dataType) {
                dataTypeVertex = setDataType(graph.vertexes[rowResult.vertexId!], attribute.dataType);
            }

            if (component && (component !== "TextBox" || attribute.props)) {
                const compVertex = setComponent(graph.vertexes[rowResult.vertexId!], component);
                if (compVertex && !dataTypeVertex) {
                    const dataTypeDefault = getChildVertex(graph, ["$0Default"], compVertex,);
                    if (dataTypeDefault.error) {
                        console.warn(`Component dataType not configured ${component}`);
                    } else {
                        dataTypeVertex = setDataType(graph.vertexes[rowResult.vertexId!], dataTypeDefault.vertex!.P[IdAttr]);
                    }
                }

                if (compVertex && attribute.props) {
                    for (const property in attribute.props) {
                        const props = getCompPropsMap(graph, compVertex);
                        if (props[property]) {
                            const rowResult = newRow(graph, setGraph, txnId, parentVertex, "AttrProp", "AttrProp", {value: attribute.props[property]});
                            if (!rowResult.error) {
                                setSelectionValue(
                                    txnId,
                                    graph.vertexes[rowResult.vertexId!], graph, setGraph,
                                    {P: {[IdAttr]: "Name"}} as unknown as Vertex,
                                    props[property].id,
                                );
                            }
                        }
                    }
                }
            }

        }
    }
    // @ts-ignore
    const importCollections = () => {
        const file = componentPropsInputRef!.files![0];

        if (file) {
            file.text().then(async (jsonText) => {
                const json = JSON.parse(jsonText);
                let txnId = getNewTxnId(); // Note txnId 0 not working
                for (const collectionId in json) {
                    const collection = json[collectionId];
                    const name = collection["name"] as string;
                    const title = collection["title"] as string;

                    const parentVertexId = getNewGraphId();
                    addNewVertex(txnId, newVertex(parentVertexId, ['Coll'], {name, title}), graph, setGraph);
                    insertAttributes(txnId, graph.vertexes[parentVertexId], collection);
                }
                commitTxn(txnId, Ws);
                alert("inserting properties finished.");
            });
        }
    };

    const makeASampleForm = () => {
        // get all the fields
        const vertexId = getNewGraphId();
        const txnId = getNewTxnId();
        addNewVertex(txnId, newVertex(vertexId, ["Coll"], {
            [IdAttr]: "TestForm",
            title: "Test Form",
            table: true
        }), graph, setGraph);
        const existingVertex = graph.vertexes[vertexId];
        for (const compVertexId of graph.vertexLabelIdMap["Comp"]) {
            const componentVertex = graph.vertexes[compVertexId];
            const componentName = componentVertex.P[IdAttr];
            if (["DropDownBox", "Bullet", "CircularGauge", "LinearGauge", "ProgressBar"].includes(componentName)) continue;
            const newRow1 = newRow(graph, setGraph, txnId, existingVertex, "Attr");
            replaceVertexProperties(txnId, newRow1.vertexId!, graph, setGraph, {
                [IdAttr]: getId(componentName),
                displayName: componentName
            });
            const dataType = getParentVertex(["DataType$0"], componentVertex, graph);
            if (!dataType.error) {
                // set component dataType and component
                setSelectionValue(
                    txnId,
                    graph.vertexes[newRow1.vertexId!], graph, setGraph,
                    // @ts-ignore
                    {P: {[IdAttr]: "dataType"}} as Vertex,
                    dataType.vertex!.id,
                );
                setSelectionValue(
                    txnId,
                    graph.vertexes[newRow1.vertexId!], graph, setGraph,
                    // @ts-ignore
                    {P: {[IdAttr]: "comp"}} as Vertex,
                    compVertexId,
                );
            }
        }
        commitTxn(txnId, Ws);
    };

    // @ts-ignore
    const importAllCSV = () => {
        const form = getFormMetaData(graph, setGraph, 'Import');
        if (form.error) return form.error;
        const record = new Record({ws: Ws});
        const createResult = record.create(graph, setGraph, form.form![IdAttr]);
        record.createMeta(form.form!, graph, setGraph);
        if (createResult.error) return createResult.error;


        // 1. import dataTypes
        updateImportRecord(graph, setGraph, "dataType", record, false);
        mergeVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
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
        onDataDirectoryImportClick(record, Ws, graph, setGraph);
        // 2. Import components
        updateImportRecord(graph, setGraph, 'component', record, false);
        mergeVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
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
// ButtonGroup\t\t\tForm\tTRUE
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
        onDataDirectoryImportClick(record, Ws, graph, setGraph);
        // 3. Import dataTypeDefault
        updateImportRecord(graph, setGraph, 'dataTypeDefault', record, false);
        mergeVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
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
        onDataDirectoryImportClick(record, Ws, graph, setGraph);

        updateImportRecord(graph, setGraph, 'user', record, false);
        mergeVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
            csv: `name\temail\tpass\trole
Test1\ttest1@test.com\ttest1\tAdmin
Test2\ttest2@test.com\ttest2\tUser`,
        });
        onDataDirectoryImportClick(record, Ws, graph, setGraph);

        updateImportRecord(graph, setGraph, 'role', record, false);
        mergeVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
            csv: `name
Admin
User`,
        });
        onDataDirectoryImportClick(record, Ws, graph, setGraph);

        updateImportRecord(graph, setGraph, "perm", record, false);
        mergeVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
            csv: `name
insert
edit
view
delete`,
        });
        onDataDirectoryImportClick(record, Ws, graph, setGraph);

    };
    const importMainNavigation = () => {
        const record = new Record({ws: Ws});
        record.create(graph, setGraph, "Nav", {});
        record.createMeta(AttrsAdminTableData["Nav"], graph, setGraph);
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
            graph,
            setGraph
        );
        record.commitTxn();
        alert("Imported Navigation")
    }

    const importNSData = () => {
        const file = importNSDataInputRef!.files![0];

        function nsTypeToGraphType(type: string) {
            let dataType;
            switch (type) {
                case "address": {
                    dataType = "Map";
                    break;
                }
                case "bigdecimal": {
                    dataType = "Float";
                    break;
                }
                case "ccexpdate": {
                    dataType = "Date";
                    break;
                }
                case "ccnumber": {
                    dataType = "Float";
                    break;
                }
                case "ccvalidfrom": {
                    dataType = "Date";
                    break;
                }
                case "checkbox": {
                    dataType = "Boolean";
                    break;
                }
                case "clobtext": {
                    dataType = "String";
                    break;
                }
                case "currency": {
                    dataType = "Float";
                    break;
                }
                case "currency2": {
                    dataType = "Float";
                    break;
                }
                case "date": {
                    dataType = "Date";
                    break;
                }
                case "datetime": {
                    dataType = "LocalDateTime";
                    break;
                }
                case "datetimetz": {
                    dataType = "LocalDateTime";
                    break;
                }
                case "double": {
                    dataType = "Float";
                    break;
                }
                case "email": {
                    dataType = "String";
                    break;
                }
                case "emails": {
                    dataType = "String";
                    break;
                }
                case "file": {
                    dataType = "Integer";
                    break;
                }
                case "float": {
                    dataType = "Float";
                    break;
                }
                case "identifier": {
                    dataType = "String";
                    break;
                }
                case "identifieranycase": {
                    dataType = "String";
                    break;
                }
                case "image": {
                    dataType = "Integer";
                    break;
                }
                case "integer": {
                    dataType = "Integer";
                    break;
                }
                case "label": {
                    dataType = "String";
                    break;
                }
                case "mmyydate": {
                    dataType = "Date";
                    break;
                }
                case "multiselect": {
                    dataType = "List";
                    break;
                }
                case "namevaluelist": {
                    dataType = "List";
                    break;
                }
                case "nonnegfloat": {
                    dataType = "Float";
                    break;
                }
                case "password": {
                    dataType = "String";
                    break;
                }
                case "percent": {
                    dataType = "Float";
                    break;
                }
                case "period": {
                    dataType = "Float";
                    break;
                }
                case "phone": {
                    dataType = "String";
                    break;
                }
                case "poscurrency": {
                    dataType = "Float";
                    break;
                }
                case "posfloat": {
                    dataType = "Float";
                    break;
                }
                case "posinteger": {
                    dataType = "Integer";
                    break;
                }
                case "radio": {
                    dataType = "String";
                    break;
                }
                case "rate": {
                    dataType = "Float";
                    break;
                }
                case "ratehighprecision": {
                    dataType = "Float";
                    break;
                }
                case "richtext": {
                    dataType = "String";
                    break;
                }
                case "rtext": {
                    dataType = "String";
                    break;
                }
                case "select": {
                    dataType = "Integer";
                    break;
                }
                case "ssnumber": {
                    dataType = "Float";
                    break;
                }
                case "summary": {
                    dataType = "String";
                    break;
                }
                case "text": {
                    dataType = "String";
                    break;
                }
                case "textarea": {
                    dataType = "String";
                    break;
                }
                case "time": {
                    dataType = "LocalTime";
                    break;
                }
                case "timeofday": {
                    dataType = "LocalTime";
                    break;
                }
                case "timetrack": {
                    dataType = "Duration";
                    break;
                }
                case "url": {
                    dataType = "String";
                    break;
                }
                case "year": {
                    dataType = "Integer";
                    break;
                }
            }
            return dataType;
        }

        function importNsData_(json: { [p: string]: NsMetaJson }) {
            alert('importing');
            // TODO: make import with txnId 0 working.
            let txnId = getNewTxnId();
            const splitTransaction = true;
            // statistics:
            // 1. after 1.30-minutes payload
            // 2. after 20 sec ack
            // 3. after 1 min final

            // we need to increase bolt connection timeout second because from 18 seconds to 180 seconds,?
            // if it closes in 18 seconds backend is not replying, maybe we should give proper error for it.?


            function fieldsInsert(fields: Field[], collectionVertex: Vertex) {
                for (const field of fields) {
                    let description = field.help;
                    if (description) {
                        description = description.replaceAll(/<a href.*">([\w ]+)<\/a>/g, "$1");
                    }
                    let type = field.type;
                    // s.add(type);
                    if (type) {
                        let dataType = nsTypeToGraphType(type);

                        if (dataType) {
                            if (collectionVertex) {
                                const dataTypeVertex = findVertexByLabelAndUniqueId("DataType", IdAttr, dataType, graph);
                                if (!dataTypeVertex) {
                                    console.log("dataType not found", dataType);
                                    continue;
                                }

                                const rowResult = newRow(
                                    graph,
                                    setGraph,
                                    txnId,
                                    collectionVertex,
                                    "Attr"
                                );
                                replaceVertexProperties(txnId, rowResult.vertexId!, graph, setGraph, {
                                    name: field.id,
                                    displayName: field.label,
                                    definition: field.help,
                                    required: field.required
                                });
                                setSelectionValue(
                                    txnId,
                                    graph.vertexes[rowResult.vertexId!], graph, setGraph,
                                    {P: {[IdAttr]: "DataType"}} as unknown as Vertex,
                                    dataTypeVertex.id
                                );
                            }
                        } else {
                            console.log("dataType Not Found:", name, type);
                        }
                    }
                }
            }

            for (const collectionId_ in json) {
                const collection = json[collectionId_];
                const fields = collection["fields"];
                if (!fields) continue;
                const label = collection.label;
                const collectionId = collection.id;
                let collectionVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, `${collectionId}`, graph);
                if (!collectionVertex) {
                    const id = getNewGraphId();
                    const newCollVertex = addNewVertex(txnId, newVertex(id, ["Coll"], {
                        name: collectionId,
                        title: label,
                        supportCustomFields: collection.supportCustomFields,
                        searchOnly: collection.searchOnly,
                        supportDeletedRecordSearch: collection.supportDeletedRecordSearch
                    }), graph, setGraph);
                    if (newCollVertex.error) {
                        continue;
                    } else {
                        collectionVertex = graph.vertexes[id];
                    }
                } else {
                    // not updating vertex properties.
                }
                fieldsInsert(fields, collectionVertex);
            }
            if (splitTransaction) commitTxn(txnId, Ws);

            if (splitTransaction) txnId = getNewTxnId();
            for (const collectionId_ in json) {
                const collection = json[collectionId_];
                const collectionId = collection.id;
                const sublists = collection["sublists"];
                if (!sublists) continue;
                let collectionVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, `${collectionId}`, graph)!;

                for (const sublist of sublists) {
                    const sublistCollName = `${collectionId}${sublist.id}`;
                    let collVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, sublistCollName, graph);
                    if (!collVertex) {
                        const id = getNewGraphId();
                        const newCollVertex = addNewVertex(txnId, newVertex(id, ["Coll"], {
                            name: sublistCollName,
                            title: sublist.label
                        }), graph, setGraph);
                        if (newCollVertex.error) {
                            continue;
                        } else {
                            collVertex = graph.vertexes[id];
                        }
                    } else {
                        // not updating vertex properties.
                    }
                    const fields = sublist["fields"];
                    if (fields) {
                        fieldsInsert(fields, collVertex);
                    }

                    const rowResult = newRow(
                        graph,
                        setGraph,
                        txnId,
                        collectionVertex,
                        "CollChild"
                    );
                    replaceVertexProperties(txnId, rowResult.vertexId!, graph, setGraph, {
                        displayName: sublist.label,
                        name: sublist.id
                    });
                    setSelectionValue(
                        txnId,
                        graph.vertexes[rowResult.vertexId!], graph, setGraph,
                        {P: {[IdAttr]: "coll"}} as unknown as Vertex,
                        collVertex.id
                    );


                }
            }
            if (splitTransaction) commitTxn(txnId, Ws);

            if (splitTransaction) txnId = getNewTxnId();
            for (const collectionId_ in json) {
                const collection = json[collectionId_];
                const collectionId = collection.id;
                const tabs = collection["tabs"];
                if (!tabs) continue;
                let collectionVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, `${collectionId}`, graph)!;

                for (const tab of tabs) {
                    const rowResult = newRow(
                        graph,
                        setGraph,
                        txnId,
                        collectionVertex,
                        "CollTab"
                    );
                    replaceVertexProperties(txnId, rowResult.vertexId!, graph, setGraph, {
                        displayName: tab.label,
                        name: tab.name
                    });
                }
            }
            if (splitTransaction) commitTxn(txnId, Ws);

            if (splitTransaction) txnId = getNewTxnId();
            for (const collectionId_ in json) {
                const collection = json[collectionId_];
                const collectionId = collection.id;
                const transformTypes = collection["transformTypes"];
                if (!transformTypes) continue;
                let collectionVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, `${collectionId}`, graph)!;

                for (const transformType of transformTypes) {
                    const rowResult = newRow(
                        graph,
                        setGraph,
                        txnId,
                        collectionVertex,
                        "CollTransform"
                    );
                    replaceVertexProperties(txnId, rowResult.vertexId!, graph, setGraph, {
                        fieldDefaults: transformType.fieldDefaults
                    });
                    let collVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, transformType.targetRecordType, graph);
                    if (!collVertex) {
                        console.log("transform collection not found", transformType.targetRecordType);
                        continue;
                    }
                    setSelectionValue(
                        txnId,
                        graph.vertexes[rowResult.vertexId!], graph, setGraph,
                        {P: {[IdAttr]: "coll"}} as unknown as Vertex,
                        collVertex.id
                    );
                }
            }
            commitTxn(txnId, Ws);


            /*
             transform collection not found vendorBill
             transform collection not found vendorCredit
             transform collection not found vendorPayment
             transform collection not found cashRefund
             transform collection not found cashSale
             transform collection not found creditMemo
             transform collection not found customSale
             2 transform collection not found customPurchase
            */

            // because multiple transactions not working splitting it
            // commitTxn(txnId, Ws);
        }

        if (file) {
            file.text().then((jsonText) => {
                const json = JSON.parse(jsonText) as { [key: string]: NsMetaJson };
                batch(() => {
                    importNsData_(json);
                })
                // alert("inserting ns data finished.");
                console.log("inserting ns data finished.", new Date());
            });
        }
    };
    // Hack to remount the component

    const C = (props: { title: string; subtitle: string; children: JSX.Element }) => {
        return (
            <div class="b:2">
                <div class="p:10 bb:1">
                    <h2 class="uk-margin-remove-bottom">{props.title}</h2>
                    <span>{props.subtitle}</span>
                </div>
                <div class="m:0 p:12">{props.children}</div>
            </div>
        );
    };

    // @ts-ignore
    return (
        <>
            <div class="mb:1.5rem mt:10 m:6">
                <div
                    class="grid-cols:2 grid-cols:3@xs grid-cols:3@sm grid-cols:3@md grid-cols:3@lg grid-cols:3@xl gap:10 w:full text:center">
                    <C title={"Backup"} subtitle={"Backup in memory graph to different targets"}>
                        <div class="m:0 p:12">
                            <div class="m:1rem flex gap:0.5rem">
                                <button type="button" onclick={backupToIndexDB_}>
                                    Backup To IndexDB
                                </button>
                                <button type="button" onclick={downloadJson}>
                                    Download Json
                                </button>
                            </div>
                        </div>
                    </C>
                    <C title={"Restore"} subtitle={"Restore graph from different targets to the memory"}>
                        <div class="m:0 p:12">
                            <button type="button" onclick={() => restoreFromIndexDB(setGraph)}>
                                Restore From IndexDB
                            </button>
                            <input ref={fileInputRef!} type="file" accept="image/*" multiple
                                   style="display: hidden"></input>
                            <button type="button" onClick={restoreFromFile}>
                                <span>Restore From JSON</span>
                            </button>
                        </div>
                    </C>
                    <C title={"Graph Functions"} subtitle={"Other graph functions"}>
                        <div class="m:0 p:12">
                            <div class="m:1rem flex gap:0.5rem">
                                <button type="button" onclick={() => resetDatabase(setGraph)}>
                                    Clear in memory store
                                </button>
                            </div>
                        </div>
                    </C>
                    <C title={"Links"} subtitle={"Simple Import"}>
                        <div class="m:0 p:12">
                            <div class="m:1rem flex gap:0.5rem">
                                <A class="b:2|solid|blue-40" href={`${APP_BASE_URL}/SimpleImport`}>Go to Simple Import</A>
                                <A class="b:2|solid|blue-40" href={`${APP_BASE_URL}/Graph`}>Go to Graph</A>
                                <A class="b:2|solid|blue-40" href={`${APP_BASE_URL}/Nav`}>Configure Navigation</A>
                            </div>
                        </div>
                    </C>
                    <C title={"Graph Functions"} subtitle={"Simple Import"}>
                        <div class="m:0 p:12">
                            <div class="m:1rem flex gap:0.5rem">
                                <button type="button" onClick={makeASampleForm}>
                                    <span>Make a sample Form</span>
                                </button>
                            </div>
                        </div>
                    </C>
                    <C title={"Graph Functions"} subtitle={"Import All CSV"}>
                        <div class="m:0 p:12">
                            <div class="m:1rem flex gap:0.5rem">
                                <button type="button" onClick={importAllCSV}>
                                    <span>Import all csv</span>
                                </button>
                                <button type="button" onClick={importMainNavigation}>
                                    <span>Import Main Navigation</span>
                                </button>
                            </div>
                        </div>
                    </C>
                    <C title={"Import NS Data"} subtitle={"Import Netsuite Data"}>
                        <div class="m:0 p:12">
                            <div class="m:1rem flex gap:0.5rem">
                                <input ref={importNSDataInputRef!} type="file" accept="json"
                                       style="display: hidden"></input>
                                <button type="button" onClick={importNSData}>
                                    <span>Import NS Data</span>
                                </button>
                            </div>
                        </div>
                    </C>
                </div>

            </div>


        </>
    );
};

export default BackupRestore;

