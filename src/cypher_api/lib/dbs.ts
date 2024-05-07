import neo4j, { Driver, Session } from "neo4j-driver";

export interface DBConnection {
  driver: Driver;
  session?: Session;
}
