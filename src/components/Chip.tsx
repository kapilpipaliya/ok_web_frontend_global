import { For, createSignal } from "solid-js";

export function StatusChip(props: Readonly<{ status: string }>) {
  const [status] = createSignal(props.status);

  const getStatusStyles = () => {
    switch (status()) {
      case "pending":
        return "color: orange; background-color: white;border: 1px solid orange; ";
      case "completed":
        return "color: rgba(1, 130, 1); background-color: white;border: 1px solid rgba(1, 130, 1); ";
      case "cancelled":
        return "color: red; background-color: white;border: 1px solid red; ";
      default:
        return "color: gray; background-color: white;border: 1px solid gray; ";
    }
  };

  return (
    <span
      style={`display: inline-block; padding: 4px 8px; border-radius: 5px; font-size: 14px; font-weight: bold; text-transform: uppercase; ${getStatusStyles()}`}
    >
      {status()}
    </span>
  );
}

export function ChipDropDown(
  props: Readonly<{
    onChanged: (value: string) => void;
    selectedItem: string;
  }>,
) {
  const options = ["pending", "completed", "cancelled"];

  const [status, setStatus] = createSignal(props.selectedItem);

  const getStatusStyles = (data: string) => {
    switch (data) {
      case "pending":
        return "color: orange; background-color: white;border: 1px solid orange;outline: orange;";
      case "completed":
        return "color: rgba(1, 130, 1); background-color: white;border: 1px solid rgba(1, 130, 1); outline: rgba(1, 130, 1);";
      case "cancelled":
        return "color: red; background-color: white;border: 1px solid red; outline: red;";
      default:
        return "color: gray; background-color: white;border: 1px solid gray; ";
    }
  };

  return (
    <select
      onChange={(event) => {
        const newValue = event.currentTarget.value;
        setStatus(newValue); // Update the signal
        props.onChanged(newValue); // Callback to parent component
      }}
      style={`display: inline-block; padding: 4px 8px; border-radius: 5px; font-size: 14px; font-weight: bold; text-transform: uppercase; ${getStatusStyles(
        status(),
      )}`}
      value={status()}
    >
      <For each={options}>
        {(option) => (
          <option value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        )}
      </For>
    </select>
  );
}
