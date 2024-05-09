import { Session } from "neo4j-driver";
import { TransactionPromise } from "neo4j-driver-core";


export async function checkPropertyExists(
  nodeLabel: string,
  session: Session | TransactionPromise,
  property: string,
  value: any,
) {
  const query = `MATCH (u:${nodeLabel}) WHERE u.${property} = $value RETURN u`;
  const result = await session.run(query, { value });
  return result.records.length > 0;
}
