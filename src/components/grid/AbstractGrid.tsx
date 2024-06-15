import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createResource, createSignal, Show } from "solid-js";
import { useContext } from "solid-js";
import { GraphContext, } from "~/lib/graph/graph";
import {Breadcrumb} from "~/components/Breadcrumb";
import {DataGrid} from "./DataGrid";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { breadcrumbData } from "~/lib/constants";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";

interface AbstractGridProps {
  tableId: string;
}

export function AbstractGrid(props: AbstractGridProps) {
  const [locationData, setLocationData] = createSignal([]);
  const [graph, setGraph] = useContext(GraphContext)!;
  const param = useLocation();
  const navigate = useNavigate();debugger
  

  async function getNavData() {
    const data: any = getTreeData(graph, setGraph, {
      collection: paginationExpression({ coll: "Nav", filter: "Navigation" }),
      child: {
        collection: "->NavAttr",
        child: { collection: "->NavAttr", child: { collection: "->NavAttr" } },
      },
    });
    return data?.[0]?.children || [];
  }
  console.log('hie', props.tableId)
  const [tableId, setTableId] = createSignal("");
  createEffect(() => {
    console.log('hi2', props.tableId)
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
          title={`${nav()[2]}`}
          breadcrumb={[
            ...breadcrumbData,
            { name: `${nav()[1]}` },
            { name: nav()[2] },
          ]}
        />
      </Show>

      <Show when={tableId()}>
        <DataGrid tableId={tableId()} />
      </Show>
    </>
  );
}
