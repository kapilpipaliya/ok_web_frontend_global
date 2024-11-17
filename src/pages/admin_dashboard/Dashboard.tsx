import { createSignal, Show } from "solid-js";
import { DataGrid } from "~/components/grid/DataGrid";
import { TabsWithUnderline } from "~/components/styled/SimpleTabs";

export default function AdminDashboard() {
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const handleTabClick = (index: number) => {
    setSelectedIndex(index);
  };

  const tabs = [
    { key: "pages", label: "Pages" },
    { key: "forms", label: "Forms" },
  ];

  return (
    <div>
      <TabsWithUnderline
        displayValueKey="label"
        onTabClick={handleTabClick}
        selectedIndex={selectedIndex()}
        tabs={tabs}
      />
      <Show when={selectedIndex() + 1} keyed>
        <DataGrid
          isShowPagination={true}
          tableId={selectedIndex() === 0 ? "Page" : "Form"}
      />  
      </Show>  
    </div>
  );
}
