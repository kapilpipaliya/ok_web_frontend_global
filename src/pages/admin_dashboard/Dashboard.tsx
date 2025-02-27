import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, onCleanup } from "solid-js";

import { TabsWithUnderline } from "~/components/styled/SimpleTabs";
import { DataGrid } from "~/features/grid/DataGrid";

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKey = (searchParams.tab as string) || "Page";
  const [selectedKey, setSelectedKey] = createSignal(initialKey);

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

  const tabs = [
    { key: "Page", label: "Pages" },
    { key: "Form", label: "Forms" },
    { key: "Component", label: "Components" },
    { key: "TemplatePage", label: "Templates" },
    { key: "EmailTemplate", label: "Email Templates" },
  ];

  onCleanup(() => {
    setSearchParams({ tab: selectedKey() });
  });

  return (
    <div>
      <TabsWithUnderline
        displayValueKey="label"
        onTabClick={handleTabClick}
        selectedKey={selectedKey()}
        tabs={tabs}
      />
      <DataGrid isShowPagination={true} tableId={selectedKey()} />
    </div>
  );
}
