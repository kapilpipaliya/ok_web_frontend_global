import { toTitle } from "case-switcher-js";
import { createSignal, Show } from "solid-js";

import { DataGrid } from "~/components/grid/DataGrid";
import { PageDesignerLabels } from "~/components/page_designer/functions/PageDesignerLabels";
import { TabsWithUnderline } from "~/components/styled/SimpleTabs";

export default function AdminDashboard() {
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const handleTabClick = (index: number) => {
    setSelectedIndex(index);
  };
  const tabs = PageDesignerLabels.filter(label => label !== "CompExample").map((label) => ({
    key: label,
    label: toTitle(label) + 's',
  }));

  return (
    <div>
      <TabsWithUnderline
        displayValueKey="label"
        onTabClick={handleTabClick}
        selectedIndex={selectedIndex()}
        tabs={tabs}
      />
      <DataGrid
        isShowPagination={true}
        tableId={tabs[selectedIndex()].key}
      />
    </div>
  );
}
