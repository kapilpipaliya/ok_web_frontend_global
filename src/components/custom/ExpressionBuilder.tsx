import { For, Show, useContext } from "solid-js";
import { TextField } from "~/components/solid-blocks/blocks";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import { Icon } from "@iconify-icon/solid";
import { GraphContext, Vertex } from "~/lib/graph/graph";
import MultiSelect from "./MultiSelect";
import { binops, unops } from "~/lib/jsep";
import { createStore } from "solid-js/store";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { NestedExpressionBuilder } from "./NestedExpressionBuilder";
import CustomModal from "./CommonDialog";
import { setValueGlobal } from "~/lib/Utils";
type Option =
  | Record<string, string | number | boolean | unknown>
  | string
  | number;
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

export const ExpressionBuilder = (props: {
  content: string;
  title: string;
  component: string;
  meta: Vertex;
  setValue: (data: any) => void;
  txnId?: number;
  data?: any;
}) => {
  let state = props.content.split("+").map(
    (value) =>
      ({ value }) as {
        unAryOperator?: Option;
        value: string;
        binAryOperator?: Option;
        error: boolean;
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
  const { Ws } = useContext(WsContext);
  const handleInsert = () => {
    setContentList((prev) => [...prev, { value: "", error: false }]);
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
      value: e.target.value,
      error: e.target.value.trim() === "",
    };
    setContentList(updatedList);
  };

  const handleSubmit = () => {
    const updatedList = contentList.map((item) => {
      if (item.value.trim() === "") {
        return { ...item, error: true };
      } else {
        return item;
      }
    });
    setContentList(updatedList);
    const hasErrors = contentList.some((item) => item.error);
    if (hasErrors) return;

    let expressionParts: string[] = [];
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
        props.data!,
        finalExpression,
        Ws,
        false,
      );
    }
  };

  const handleCancel = () => {
    // TODO: handle cancel or Re-render component when open model
    // setContentList()
  };

  return (
    <div>
      <CustomModal
        buttonIcon={"carbon:settings-edit"}
        title="Expression Builder"
        body={
          <div>
            <For each={contentList}>
              {(item, index) => (
                <div class={"p:2"}>
                  <div class={"flex ai:center jc:space-between mt:4 mb:2"}>
                    <span class={"font-weight:medium f:14"}>
                      Expression : {index() + 1}
                    </span>
                    <Show when={index() > 0}>
                      <Icon
                        icon={"fluent:delete-28-regular"}
                        height={20}
                        width={20}
                        class={"cursor:pointer"}
                        style={{ color: "red" }}
                        onclick={() => handleDelete(index())}
                      />
                    </Show>
                  </div>
                  <div class={"flex ai:center jc:space-between"}>
                    <div class={"flex"}>
                      <MultiSelect
                        isObject
                        displayValueParent="P"
                        displayValueChild="name"
                        options={Object.keys(unops).map((key) => ({
                          id: key,
                          P: { name: key },
                        }))}
                        avoidHighlightFirstOption
                        placeholder={"Unary"}
                        onSelect={(e) => onUnaryOperatorChange(index(), e[0])}
                        onRemove={(e) => onUnaryOperatorChange(index())}
                        customCloseIcon={<Icon icon={"ic:round-close"} />}
                        selectionLimit={1}
                        singleSelect
                        // selectedValues={}
                      />
                    </div>
                    <TextField
                      labelClass={"w:100% mr:.5rem ml:.5rem"}
                      style={`border: ${item.error ? "1px solid red " : ""}`}
                      class={"global-style flex-col"}
                      {...props.meta?.P.props}
                      placeholder={"Write Expression..."}
                      onchange={(e: any) => handleChange(index(), e)}
                      value={item.value}
                      title={item.error ? "Please fill in this field" : ""}
                      trailing={
                        <NestedExpressionBuilder
                          content={item.value}
                          meta={props.meta}
                          data={props.data}
                          txnId={props.txnId}
                          setValue={props.setValue}
                          onClose={handleCancel}
                        />
                      }
                    />
                    <div class={"flex"}>
                      <MultiSelect
                        isObject
                        displayValueParent="P"
                        displayValueChild="name"
                        options={Object.keys(binops).map((key) => ({
                          id: key,
                          P: { name: key },
                        }))}
                        avoidHighlightFirstOption
                        placeholder={"Binary"}
                        onSelect={(e) => onBinaryOperatorChange(index(), e[0])}
                        onRemove={(e) => onBinaryOperatorChange(index())}
                        customCloseIcon={<Icon icon={"ic:round-close"} />}
                        selectionLimit={1}
                        singleSelect
                        // selectedValues={}
                      />
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        }
        footer={(toggle) => (
          <div class={"flex ai:center jc:end"}>
            <CustomButton
              variant={"soft"}
              onclick={handleInsert}
              {...props.meta.P.props}
            >
              Add
            </CustomButton>
            <CustomButton
              variant={"outlined"}
              class="border-color:#FF0000 color:#FF0000 ml:5"
              onclick={toggle}
              {...props.meta.P.props}
            >
              Cancel
            </CustomButton>

            <CustomButton
              variant="contained"
              onclick={() => {
                handleSubmit();
                toggle((v) => !v);
              }}
              {...props.meta.P.props}
            >
              Submit
            </CustomButton>
          </div>
        )}
        dialogClass="min-w:30% r:10px p:0"
      />
    </div>
  );
};
