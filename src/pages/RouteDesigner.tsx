import { For, Match, Show, Switch, createSignal } from "solid-js";

import { Table, TableBodyCell, TableHeadCell } from "~/components/Table";

export function RouteDesigner() {
  const [elements, setElements]: any = createSignal([]);
  const [showModal, setShowModal] = createSignal(false);

  const addElement = (type: any) => {
    setElements([...elements(), {id: Date.now(), type}]);
  };
  const getFormFields = (event: any) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const fields: any = {};
    formData.forEach((value, key) => {
      fields[key] = value;
    });
  };

  return (
    <div style="padding: 20px;">
      <form onSubmit={getFormFields}>
        <div style="margin-bottom: 20px;">
          <button onClick={() => addElement("table")}>
            Add Table
          </button>
          <button onClick={() => addElement("button")}>
            Add Button
          </button>
          <button onClick={() => addElement("modal")}>
            Add Modal
          </button>
        </div>
        <div>
          <For each={elements()}>
            {(element: any) => (
              <DynamicElement
                element={element}
                setShowModal={setShowModal}
                showModal={showModal}
              />
            )}
          </For>
        </div>
      </form>

      <Show when={showModal()}>
        <div
          style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;">
          <div style="background: white; padding: 20px; border-radius: 5px;">
            <p>This is a modal</p>
            <button
              // variant="outlined"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}

const DynamicElement = (props: {
  element: any;
  setShowModal: any;
  showModal: any;
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
        <button style="margin-bottom: 20px; padding: 10px;">
          Button
        </button>
      </Match>
      <Match when={props.element.type === "modal"}>
        <div style="position: relative; margin-bottom: 20px;">
          <button
            onClick={() => props.setShowModal(true)}
            style="padding: 10px;"
          >
            Open Modal
          </button>
        </div>
      </Match>
      <Match when={true}>
        <p>Unknown Element</p>
      </Match>
    </Switch>
  );
};
