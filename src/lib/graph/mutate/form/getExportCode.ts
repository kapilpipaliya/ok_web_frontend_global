import type { Store } from "solid-js/store";

import { klona } from "klona/json";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { useToast } from "~/components/Toast";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { findVertexByLabelAndUniqueId } from "../../get/sync/findVertex";
import { getPkForCollection } from "../../get/sync/getPkForCollection";
import { getToEdge } from "../../get/sync/getToEdge";
import { getSublistRows, getSublistRowsForType } from "./rowFunction";

export function getExportCode(
  graph: Store<GraphInterface>,
  meta: Vertex,
  data: Vertex,
) {
  const getChildren = (
    meta: Vertex,
    vertex: Vertex,
    result: {
      [key: string]: any;
    },
  ) => {
    const { showErrorToast } = useToast();

    const metaVertexes = getSublistRowsForType(graph, "Attr", meta);
    // const props = meta.P;
    const selectMetaVertexes = metaVertexes.filter((meta) =>
      ["SelectBox", "TagBox"].includes(meta.P.componentName),
    );
    const tableMetaVertexes = metaVertexes.filter((meta) =>
      ["Table"].includes(meta.P.componentName),
    );

    for (const metaVertex of selectMetaVertexes) {
      const metaProps = metaVertex.P;

      if (metaProps.inward) {
        // result['IN'] = {} as {[EdgeType: string]: {[primaryKey: string]: any}[]};
      } else {
        const type = getToEdge(metaVertex, vertex);
        // also can use selectedValue function;
        const childVertexes = getSublistRows(graph, metaVertex, vertex);

        for (const v of childVertexes) {
          // getCollFromCollectionExpr function is not available means Cant find a collection from meta,
          // so get Primary Key from Vertex itself.
          const label = v.L[0];
          if (FormMetaData[label]) {
            const pksResult = {} as { [primaryKey: string]: any };
            pksResult.name = v.P.name;
            if (!result.OUT) {
              result.OUT = {} as {
                [EdgeType: string]: { [primaryKey: string]: any }[];
              };
            }
            result.OUT[type] = [pksResult];
            // getChildren(metaVertex, v, pksResult);
          } else {
            const collVertex = findVertexByLabelAndUniqueId(
              graph,
              "Form",
              "name",
              label,
            );
            if (!collVertex) {
              showErrorToast(`Collection not defined: ${label}`);
              continue;
            }
            const pks = getPkForCollection(graph, collVertex);

            const pksResult = {} as { [primaryKey: string]: any };
            for (const pk of pks) {
              pksResult[pk] = v.P[pk];
            }
            if (pks.length === 0) {
              pksResult.name = v.P.name;
            }

            if (!result.OUT) {
              result.OUT = {} as {
                [EdgeType: string]: { [primaryKey: string]: any }[];
              };
            }

            if (result.OUT[type]) {
              result.OUT[type].push(pksResult);
            } else {
              result.OUT[type] = [pksResult];
            }
            // getChildren(metaVertex, v, pksResult);
          }
        }
      }
    }
    for (const metaVertex of tableMetaVertexes) {
      const metaProps = metaVertex.P;

      if (metaProps.inward) {
        // not possible now
      } else {
        const type = getToEdge(metaVertex, vertex);
        const childVertexes = getSublistRows(graph, metaVertex, vertex);

        const out = childVertexes.map((v) =>
          getChildren(metaVertex, v, {
            ...klona(v),
            D: undefined,
            IN: undefined,
            L: v.L[0],
            OUT: undefined,
            id: undefined,
          }),
        );
        if (out.length > 0) {
          if (result.OUT) {
            result.OUT[type] = out;
          } else {
            result.OUT = { [type]: out } as {
              [EdgeType: string]: { [primaryKey: string]: any }[];
            };
          }
        }
      }
    }

    return result;
  };

  return getChildren(meta, data, {
    ...klona(data),
    D: undefined,
    IN: undefined,
    L: data.L[0],
    OUT: undefined,
    id: undefined,
  });
}
