import {getRequestURL} from "vinxi/http";
import {getSubDomain} from "~/server/getSubDomain";
import {getDriver} from "~/cypher/driver";

export const checkIfNameExistsMGCall = async (
  label: string,
  name: string,
  id?: string,
) => {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const session = (await getDriver(subDomain)).session();

  try {
    const checkQuery = id
      ? `MATCH (v:${label}) WHERE v.name = $name AND v.elementId != $id RETURN v`
      : `MATCH (v:${label}) WHERE v.name = $name RETURN v`;

    const params = id ? {name, id} : {name};
    const checkResult = await session.run(checkQuery, params);
    if (checkResult.records.length > 0) {
      return {
        error: true,
        message: "Provided name already exists",
      };
    }
    return {
      error: false,
    };
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    };
  } finally {
    await session.close();
  }
};