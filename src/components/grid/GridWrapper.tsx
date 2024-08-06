import { createEffect, createSignal, Show } from "solid-js";

import { DataGrid } from "./DataGrid";

interface AbstractGridProps {
  tableId: string;
}

export function GridWrapper(props: Readonly<AbstractGridProps>) {
  const [tableId, setTableId] = createSignal(props.tableId);
  createEffect(() => {
    setTableId("");
    props.tableId;
    setTimeout(() => setTableId(props.tableId));
  });

  /* Dont need breadcrumb for now
  const [, setLocationData] = createSignal([]);
  const [graph, setGraph] = useGraph();
  const param = useLocation();  

  async function getNavData() {
    const data = getTreeData(graph, setGraph, {
      child: {
        child: { child: { collection: "->NavAttr" }, collection: "->NavAttr" },
        collection: "->NavAttr",
      },
      collection: paginationExpression({ coll: "Nav", filter: "Navigation" }),
    });
    return data?.[0]?.children || [];
  }

  // @ts-ignore
  const getCurrentLocation = (data: NavItem[], path = []) => {
    for (const item of data) {
      if (item.P.url === param.pathname) {
        return [...path, item.name];
      }
      if (item.children) {
        // @ts-ignore
        const result = getCurrentLocation(item.children, [...path, item.name]);
        if (result.length > 0) {
          return result;
        }
      }
    }
    return [];
  };

  const [nav] = createResource(tableId, async () => {
    const navData = await getNavData();
    const filtered = getCurrentLocation(navData);

    setLocationData(filtered);
    return filtered;
  });*/

  return (
    <>
      {/* <Show when={nav()}>
        <Breadcrumb
          breadcrumb={[
            ...breadcrumbData,
            { name: `${nav()[1]}` },
            { name: nav()[2] },
          ]}
          title={`${nav()[2]}`}
        />
      </Show> */}

      <Show when={tableId()}>
        <DataGrid tableId={tableId()} />
      </Show>
    </>
  );
}
