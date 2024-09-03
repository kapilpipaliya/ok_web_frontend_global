import type { Session } from "neo4j-driver";

export async function pricing(_payload: any, dbSession: Session) {
  const query = "MATCH (n:Pricing) RETURN n;";
  const result = await dbSession.run(query);
  const plans = result.records.map((r) => r.get("n").properties);
  return {
    plans: plans,
  };
}
