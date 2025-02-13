import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";

export interface TabButtonProps {
  data: string;
  isSelected: boolean;
  onClick: () => void;
}

export function TabButton(props: TabButtonProps) {
  return (
    <li class="me-2 cursor:pointer">
      <button
        class="rounded-t-lg border-bottom-width:2.5px border-color:transparent display:inline-block p:10px white-space:nowrap"
        classList={{
          "border-color:rgb(209,213,219):hover color:rgb(75,85,99):hover":
            !props.isSelected,
          "font-weight:600 color:rgb(37,99,235) border-bottom-width:2.5px border-color:rgb(37,99,235)":
            props.isSelected,
        }}
        onclick={props.onClick}
        type="button"
      >
        {capitalizeFirstLetter(props.data)}
      </button>
    </li>
  );
}
