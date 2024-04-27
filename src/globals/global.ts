import {driver as createDriver} from "neo4j-driver";
export const isIntegerId = true;
export const driver = createDriver("bolt://65.109.174.193:1102", undefined,
  isIntegerId ? {disableLosslessIntegers: true} : undefined
);
export const neo4jSession = driver.session();
