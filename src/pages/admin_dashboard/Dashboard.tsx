import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import { TabsWithUnderline } from "~/components/styled/SimpleTabs";
import { DataGrid } from "~/features/grid/DataGrid";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { useGraph } from "~/lib/graph/graph";

export default function AdminDashboard() {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKey = (searchParams.tab as string) || "Page";
  const [selectedKey, setSelectedKey] = createSignal(initialKey);

  // Only run this effect if the route hasn't changed
  createEffect(() => {
      const tab = searchParams.tab as string;
      if (!tab) {
        setSelectedKey("Page");
      } else if (tab !== selectedKey()) {
        setSelectedKey(tab);
      }
    
  });

  const handleTabClick = (key: string) => {
    setSearchParams({ tab: key });
  };

  const tabs = () => {
    const baseTabs = [
      { key: "Page", label: "Pages" },
      { key: "Form", label: "Forms" },
      { key: "Component", label: "Components" },
      { key: "TemplatePage", label: "Templates" },
    ];

    // Only add the EmailTemplate tab if the user has admin role
    if (isAdminRole(graph)) {
      baseTabs.push({ key: "EmailTemplate", label: "Email Templates" });
    }

    return baseTabs;
  };

  return (
    <div>
      <TabsWithUnderline
        displayValueKey="label"
        onTabClick={handleTabClick}
        selectedKey={selectedKey()}
        tabs={tabs()}
      />
      <DataGrid isShowPagination={true} tableId={selectedKey()} />
    </div>
  );
}
