import { useLocation, useNavigate } from "@solidjs/router";
import { Show, createEffect, createResource, createSignal } from "solid-js";
import { useContext } from "solid-js";

import {Breadcrumb} from "~/components/Breadcrumb";
import { breadcrumbData } from "~/lib/constants";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { GraphContext, } from "~/lib/graph/graph";

import {DataGrid} from "./DataGrid";

interface AbstractGridProps {
  tableId: string;
}

export function AbstractGrid(props: AbstractGridProps) {
  const [locationData, setLocationData] = createSignal([]);
  const [graph, setGraph] = useContext(GraphContext)!;
  const param = useLocation();
  const navigate = useNavigate();
  

  async function getNavData() {
    const data: any = getTreeData(graph, setGraph, {
      child: {
        child: { child: { collection: "->NavAttr" }, collection: "->NavAttr" },
        collection: "->NavAttr",
      },
      collection: paginationExpression({ coll: "Nav", filter: "Navigation" }),
    });
    return data?.[0]?.children || [];
  }

  const [tableId, setTableId] = createSignal(props.tableId);
  createEffect(() => {
    setTableId("");
    props.tableId;
    setTimeout(() => setTableId(props.tableId));
  });

  // @ts-ignore
  const getCurrentLocation = (data: any, path = []) => {
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

  const [nav, { refetch }] = createResource(tableId, async () => {
    const navData = await getNavData();
    const filtered = getCurrentLocation(navData);

    setLocationData(filtered);
    return filtered;
  });

  return (
    <>
      <Show when={nav()}>
        <Breadcrumb
          breadcrumb={[
            ...breadcrumbData,
            { name: `${nav()[1]}` },
            { name: nav()[2] },
          ]}
          title={`${nav()[2]}`}
        />
      </Show>

      <Show when={tableId()}>
        <DataGrid tableId={tableId()} />
      </Show>
    </>
  );
}
