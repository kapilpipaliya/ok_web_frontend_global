import { createSignal, createEffect, For, Show, Match, Switch } from "solid-js";
import { Table, TableBodyCell, TableHeadCell } from "~/components/custom/Table";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import { TableHeader } from "~/components/solid-blocks/blocks/table/table";

const RouteDesigner = () => {
  const [elements, setElements]: any = createSignal([]);
  const [showModal, setShowModal] = createSignal(false);

  const addElement = (type: any) => {
    setElements([...elements(), { type, id: Date.now() }]);
  };
  const getFormFields = (event: any) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const fields: any = {};
    formData.forEach((value, key) => {
      fields[key] = value;
    });
    console.log(formData.getAll("table"));
  };

  return (
    <div style="padding: 20px;">
      <form onSubmit={getFormFields}>
        <div style="margin-bottom: 20px;">
          <CustomButton onClick={() => addElement("table")}>
            Add Table
          </CustomButton>
          <CustomButton onClick={() => addElement("button")}>
            Add Button
          </CustomButton>
          <CustomButton onClick={() => addElement("modal")}>
            Add Modal
          </CustomButton>
        </div>
        <div>
          <For each={elements()}>
            {(element: any) => (
              <DynamicElement
                element={element}
                showModal={showModal}
                setShowModal={setShowModal}
              />
            )}
          </For>
        </div>
      </form>

      <Show when={showModal()}>
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;">
          <div style="background: white; padding: 20px; border-radius: 5px;">
            <p>This is a modal</p>
            <CustomButton
              variant="outlined"
              onClick={() => setShowModal(false)}
            >
              Close
            </CustomButton>
          </div>
        </div>
      </Show>
    </div>
  );
};

const DynamicElement = (props: {
  element: any;
  showModal: any;
  setShowModal: any;
}) => {
  return (
    <Switch>
      <Match when={props.element.type === "table"}>
        <Table headers={["Header 1", "Header 2"].length}>
          <TableHeadCell style="border: 1px solid black; padding: 10px;">
            Header 1
          </TableHeadCell>
          <TableHeadCell style="border: 1px solid black; padding: 10px;">
            Header 2
          </TableHeadCell>

          <TableBodyCell>Data 1</TableBodyCell>
          <TableBodyCell>Data 2</TableBodyCell>

          <TableBodyCell>Data 3</TableBodyCell>
          <TableBodyCell>Data 4</TableBodyCell>
        </Table>
      </Match>
      <Match when={props.element.type === "button"}>
        <CustomButton style="margin-bottom: 20px; padding: 10px;">
          Button
        </CustomButton>
      </Match>
      <Match when={props.element.type === "modal"}>
        <div style="position: relative; margin-bottom: 20px;">
          <CustomButton
            style="padding: 10px;"
            onClick={() => props.setShowModal(true)}
          >
            Open Modal
          </CustomButton>
        </div>
      </Match>
      <Match when={true}>
        <p>Unknown Element</p>
      </Match>
    </Switch>
  );
};

export default RouteDesigner;
