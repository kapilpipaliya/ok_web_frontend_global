import { toTitle } from "case-switcher-js";
import { createSignal } from "solid-js";

import { DataGrid } from "~/components/grid/DataGrid";
import { PageDesignerLabels } from "~/components/page_designer/functions/PageDesignerLabels";
import { TabsWithUnderline } from "~/components/styled/SimpleTabs";

import { UserDropdownMenuDisplay } from "../admin_layout/DropdownMenuDisplay";
import { SelectThemeButton } from "../admin_layout/theme/SelectThemeButton";

export default function AdminDashboard() {
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const handleTabClick = (index: number) => {
    setSelectedIndex(index);
  };
  const tabs = [
    ...PageDesignerLabels.filter((label) => label !== "CompExample").map(
      (label) => ({
        key: label,
        label: toTitle(label.replace(/(\w+)(Page)$/, "$1")) + "s",
      }),
    ),
    {
      key: "Component",
      label: "Components",
    },
  ];

  return (
    <div>
      <div class="flex gap:4 position:fixed right:1rem">
        <SelectThemeButton />
        <UserDropdownMenuDisplay />
      </div>
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
