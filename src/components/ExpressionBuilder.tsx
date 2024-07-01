import { Icon } from "@iconify-icon/solid";
import { For, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { binops, unops } from "~/lib/expression_eval";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";

import { CustomModal } from "./CommonDialog";
import { MultiSelectField } from "./MultiSelect";
import { NestedExpressionBuilder } from "./NestedExpressionBuilder";

type Option =
  | Record<string, boolean | number | string | unknown>
  | number
  | string;
// function expressionFromTree(node) {
//     if (node.type === "BinaryExpression") {
//         return (
//             "(" +
//             expressionFromTree(node.left) +
//             "" +
//             node.operator +
//             "" +
//             expressionFromTree(node.right) +
//             ")"
//         );
//     } else if (node.type === "UnaryExpression") {
//         return node.operator + expressionFromTree(node.argument);
//     } else if (node.type === "Literal") {
//         return node.raw;
//     } else if (node.type === "Identifier") {
//         return node.name;
//     } else if (node.type === "MemberExpression") {
//         return (
//             expressionFromTree(node.object) +
//             "[" +
//             expressionFromTree(node.property) +
//             "]"
//         );
//     } else if (node.type === "CallExpression") {
//         let args = node.arguments.map((arg) => expressionFromTree(arg)).join(", ");
//         return expressionFromTree(node.callee) + "(" + args + ")";
//     } else {
//         throw new Error("Unsupported node type: " + node.type);
//     }
// }

export function ExpressionBuilder(props: Readonly<{
  component: string;
  content: string;
  data?: any;
  meta: Vertex;
  setValue: (data: any) => void;
  title: string;
  txnId?: number;
}>) {
  const state = props.content.split("+").map(
    (value) =>
      ({ value }) as {
        binAryOperator?: Option;
        error: boolean;
        unAryOperator?: Option;
        value: string;
      },
  );
  // const fetchData = (content) => {
  //     const operator = content.operator;
  //     // const left = expressionFromTree(content.left);
  //     // const right= expressionFromTree(content.right);
  //     console.log("left", content);
  //     console.log("right", content.right);
  //     console.log(traverseExpression(content));
  //
  // };
  // const data =  fetchData(jsep(props.content));
  // console.log(data);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [contentList, setContentList] = createStore(state);
  const handleInsert = () => {
    setContentList((prev) => [...prev, { error: false, value: "" }]);
  };

  const handleDelete = (index: number) => {
    setContentList((prev) => prev.filter((_, i) => i !== index));
  };

  const onUnaryOperatorChange = (index: number, value?: Option) => {
    setContentList(index, { unAryOperator: value });
  };
  const onBinaryOperatorChange = (index: number, value?: Option) => {
    setContentList(index, { binAryOperator: value });
  };

  const handleChange = (index: number, e: any) => {
    const updatedList = [...contentList];
    updatedList[index] = {
      ...updatedList[index],
      error: e.target.value.trim() === "",
      value: e.target.value,
    };
    setContentList(updatedList);
  };

  const handleSubmit = () => {
    const updatedList = contentList.map((item) => {
      if (item.value.trim() === "") {
        return { ...item, error: true };
      }
      return item;
    });
    setContentList(updatedList);
    const hasErrors = contentList.some((item) => item.error);
    if (hasErrors) return;

    const expressionParts: string[] = [];
    contentList.forEach((item, index) => {
      // If the item has a unary operator, add it before the value
      if (item.unAryOperator && typeof item.unAryOperator === "object") {
        expressionParts.push(item.unAryOperator.id as string);
      }
      expressionParts.push(item.value);

      // If the item has a binary operator, add it
      if (item.binAryOperator && typeof item.binAryOperator === "object") {
        expressionParts.push(item.binAryOperator.id as string);
      }
    });
    const finalExpression = expressionParts.join("");

    if (props.setValue) {
      props.setValue(finalExpression);
    } else {
      setValueGlobal(
        graph,
        setGraph,
        props.txnId!,
        props.meta,
        props.data,
        finalExpression,
        false,
      );
    }
  };

  const handleCancel = () => {
    // TODO: handle cancel or Re-render component when open model
    // setContentList()
  };

  return (
    <CustomModal
      body={
        <div>
          <For each={contentList}>
            {(item, index) => (
              <div class={"p:2"}>
                <div class={"flex ai:center jc:space-between mb:2 mt:4"}>
                  <span class={"f:14 font-weight:medium"}>
                    Expression : {index() + 1}
                  </span>
                  <Show when={index() > 0}>
                    <Icon
                      class={"cursor:pointer"}
                      height={20}
                      icon={"fluent:delete-28-regular"}
                      onclick={() => handleDelete(index())}
                      style={{ color: "red" }}
                      width={20}
                    />
                  </Show>
                </div>
                <div class={"flex ai:center jc:space-between"}>
                  <div class={"flex"}>
                    <MultiSelectField
                      displayValueChild="name"
                      displayValueParent="P"
                      onRemove={(e) => onUnaryOperatorChange(index())}
                      onSelect={(e) => onUnaryOperatorChange(index(), e[0])}
                      options={Object.keys(unops).map((key) => ({
                        P: { name: key },
                        id: key,
                      }))}
                      placeholder={"Unary"}
                      selectedValues={() => []}
                      selectionLimit={1}
                    />
                  </div>
                  <input
                    class={"flex-col"}
                    style={`border: ${item.error ? "1px solid red " : ""}`}
                    {...props.meta?.P}
                    onchange={(e: any) => handleChange(index(), e)}
                    placeholder={"Write Expression..."}
                    title={item.error ? "Please fill in this field" : ""}
                    value={item.value}
                  />
                  <NestedExpressionBuilder
                    content={item.value}
                    data={props.data}
                    meta={props.meta}
                    onClose={handleCancel}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                  <div class={"flex"}>
                    <MultiSelectField
                      displayValueChild="name"
                      displayValueParent="P"
                      onRemove={(e) => onBinaryOperatorChange(index())}
                      onSelect={(e) => onBinaryOperatorChange(index(), e[0])}
                      options={Object.keys(binops).map((key) => ({
                        P: { name: key },
                        id: key,
                      }))}
                      placeholder={"Binary"}
                      selectedValues={() => []}
                      selectionLimit={1}
                    />
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      }
      buttonIcon={"carbon:settings-edit"}
      dialogClass="min-w:30% r:10px p:0"
      footer={(toggle) => (
        <div class={"flex ai:center jc:end"}>
          <button
            onclick={handleInsert}
            {...props.meta.P}
          >
            Add
          </button>
          <button
            // variant={"outlined"}
            class="border-color:#FF0000 color:#FF0000 ml:5"
            onclick={toggle}
            {...props.meta.P}
          >
            Cancel
          </button>

          <button
            // variant="contained"
            onclick={() => {
              handleSubmit();
              toggle((v) => !v);
            }}
            {...props.meta.P}
          >
            Submit
          </button>
        </div>
      )}
      iconSize={14}
      title="Expression Builder"
    />
  );
}
