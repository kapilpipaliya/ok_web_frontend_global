import { toTitle } from "case-switcher-js";
import { createSignal } from "solid-js";

import { TabsWithUnderline } from "~/components/styled/SimpleTabs";
import { DataGrid } from "~/features/grid/DataGrid";
import { PageDesignerLabels } from "~/features/page_designer/functions/PageDesignerLabels";

import { UserDropdownMenuDisplay } from "../auth_menu/DropdownMenuDisplay";

export default function AdminDashboard() {
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const handleTabClick = (index: number) => {
    setSelectedIndex(index);
  };
  const tabs = [
    { key: "Page", label: "Pages" },
    { key: "Form", label: "Forms" },
    { key: "Component", label: "Components" },
    { key: "TemplatePage", label: "Templates" },
    { key: "EmailTemplate", label: "Email Templates" },
  ];

  return (
    <div>
      <TabsWithUnderline
        displayValueKey="label"
        onTabClick={handleTabClick}
        selectedIndex={selectedIndex()}
        tabs={tabs}
      />
      <DataGrid isShowPagination={true} tableId={tabs[selectedIndex()].key} />
    </div>
  );
}
