import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import { TabsWithUnderline } from "~/components/styled/SimpleTabs";
import { DataGrid } from "~/features/grid/DataGrid";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { useGraph } from "~/lib/graph/graph";

export default function AdminDashboard() {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = (searchParams.tab as string) || "Page";
  const [selectedId, setSelectedId] = createSignal(initialId);

  // Only run this effect if the route hasn't changed
  createEffect(() => {
    const tab = searchParams.tab as string;
    if (!tab) {
      setSelectedId("Page");
    } else if (tab !== selectedId()) {
      setSelectedId(tab);
    }
  });

  const handleTabClick = (id: string) => {
    setSearchParams({ tab: id });
  };

  const tabs = () => {
    const baseTabs = [
      { id: "Page", label: "Pages" },
      { id: "Form", label: "Forms" },
      { id: "Component", label: "Components" },
      { id: "TemplatePage", label: "Templates" },
    ];

    // Only add the EmailTemplate tab if the user has admin role
    if (isAdminRole(graph)) {
      baseTabs.push({ id: "EmailTemplate", label: "Email Templates" });
    }

    return baseTabs;
  };

  return (
    <div>
      <TabsWithUnderline
        displayValueKey="label"
        onTabClick={handleTabClick}
        selectedKey={selectedId()}
        tabs={tabs()}
      />
      <DataGrid isShowPagination={true} tableId={selectedId()} />
    </div>
  );
}
