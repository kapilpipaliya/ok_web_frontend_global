import { getDriver } from "../server/driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "../server/domain_utils";

export async function findVertexesMGCall(options: {
  label?: string;
  attribute?: string;
  value?: number | string;
  id?: number;
}) {
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

    console.log(vertexResult);
    if(vertexResult.records.length === 0) {
      return {
        error: true,
        vertexes: []
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
