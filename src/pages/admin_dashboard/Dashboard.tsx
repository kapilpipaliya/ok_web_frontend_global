import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import {
  type TabItem,
  TabsWithUnderline,
} from "~/components/styled/SimpleTabs";
import { DataGrid } from "~/features/grid/DataGrid";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";

import { useGraph } from "~/lib/graph/context/UseGraph";
import { PageTable } from "./PageTable";

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
    const baseTabs: TabItem[] = [
      { id: "Page", label: "Pages", icon: "ph:file-text" },
      { id: "Component", label: "Components", icon: "ph:puzzle-piece" },
    ];

    // Only add the EmailTemplate tab if the user has admin role
    if (isAdminRole(graph)) {
      baseTabs.push({
        id: "EmailTemplate",
        label: "Email Templates",
        icon: "ph:envelope",
      });
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
        iconSize={18}
      />

      <DataGrid isShowPagination={true} tableId={selectedId()} />

      {/*  In Development Remove comment */}
      {/* <PageTable /> */}
    </div>
  );
}
