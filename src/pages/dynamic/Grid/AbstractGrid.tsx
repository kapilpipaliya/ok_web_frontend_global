import { useLocation, useNavigate, useParams } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  Show,
} from "solid-js";
import { useContext } from "solid-js";
import { GraphContext, IdAttr, Vertex } from "~/lib/graph/graph";
import { getTreeDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import {
  breadcrumbData,
  capitalizeFirstLetter,
  expressionString,
} from "~/lib/Utils";
import PageHeader from "~/components/custom/Breadcumb";
import DataGrid from "./DataGrid";
import { Icon } from "@iconify-icon/solid";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";
import { getTreeData } from "~/lib/graph/get/sync/traverse";

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
      collection: expressionString({ coll: "Nav", filter: "Navigation" }),
      child: {
        collection: "->NavAttr",
        child: { collection: "->NavAttr", child: { collection: "->NavAttr" } },
      },
    });
    return data && data[0].children;
  }

  const [tableId, setTableId] = createSignal("");
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

  const [nav] = createResource(tableId, async () => {
    const navData = await getNavData();
    const filtered = getCurrentLocation(navData);

    setLocationData(filtered);
    return filtered;
  });

  return (
    <>
      <Show when={nav()}>
        <PageHeader
          title={`${nav()[0]}`}
          breadcrumb={[
            ...breadcrumbData,
            { name: `${nav()[1]}` },
            { name: nav()[2] },
          ]}
        />
      </Show>
      <div class="flex justify-content:start p:5">
        <GenericField
          meta={
            {
              P: {
                component: "Button",
                [IdAttr]: "meta",
                props: {
                  onClick: () => navigate("new"),
                  variant: "soft",
                  style: { padding: "7px 10px", 'margin-bottom': "10px" },
                  leading:
                    // TO solve Hydration error passed a function
                    () => (
                      <Icon
                        icon={"lets-icons:add-round"}
                        height={22}
                        width={22}
                      />
                    ),
                  children: "Add New",
                },
              },
            } as unknown as Vertex
          }
        />
      </div>
      <Show when={tableId()}>
        <DataGrid tableId={tableId()} />
      </Show>
    </>
  );
}
