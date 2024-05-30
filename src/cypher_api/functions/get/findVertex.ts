import { getDriver } from "../../server/driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "../../server/domain_utils";
import { Vertex } from "~/lib/graph/graph";

export async function findVertexesMGCall(options: {
  label?: string;
  attribute?: string;
  value?: number | string;
  id?: number;
}): Promise<{error?: boolean, message?: string, vertexes?: Vertex}> {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = await (await getDriver(subDomain)).session();
 
  try {
    let query;
    let params;

    if (options.id !== undefined) {
      query = `MATCH (v) WHERE id(v) = $id RETURN v`;
      params = { id: options.id };
    } else if (
      options.label &&
      options.attribute &&
      options.value !== undefined
    ) {
      query = `MATCH (v:${options.label} {${options.attribute}: $value}) RETURN v`;
      params = { value: options.value };
    } else if (
      options.label &&
      options.attribute &&
      options.value !== undefined
    ) {
      query = `MATCH (v:${options.label}}) RETURN v`;
      params = { value: options.value };
    } else {
      return { error: true, message: "Invalid parameters" };
    }
    
    const vertexResult = await driver.run(query, params);
    if(vertexResult.records.length === 0) {
      return {
        error: true,
      }
    }else{
      const vertexes = convertNodeToJson(vertexResult.records[0].get("v"));
      
      return {
        error: false,
        vertexes,
      };
    }
  } catch (error) {
    console.error(error);

    return { error: true, message: "An error occurred" };
  } 
}


// export async function findVertexByLabelAndPksMGCall(
//   label: string,
//   value: {
//     [key: string]: number | string | boolean;
//   },
//   graph: Store<GraphInterface>,
// ) {
//   if (!value) return undefined;
//   const vertexId = (graph.vertexLabelIdMap[label] || []).find((vertexId) => {
//     for (const valueKey in value) {
//       if (value[valueKey] !== graph.vertexes[vertexId].P[valueKey]) {
//         return false;
//       }
//     }
//     return true;
//   });
//   return vertexId ? graph.vertexes[vertexId] : undefined;
// }

// export async function findVertexByLabelAndUniqueIdWithSkipMGCall(
//   label: string,
//   attribute: string,
//   value: any,
//   skipId: number,
//   graph: Store<GraphInterface>,
// ) {
//   let vertexIds = graph.vertexLabelIdMap[label] || [];
//   if (skipId != undefined) {
//     vertexIds = vertexIds.filter((value) => value !== skipId);
//   }
//   const vertexId = vertexIds.find(
//     (vertexId) => value === graph.vertexes[vertexId].P[attribute],
//   );

//   return vertexId ? graph.vertexes[vertexId] : undefined;
// }
