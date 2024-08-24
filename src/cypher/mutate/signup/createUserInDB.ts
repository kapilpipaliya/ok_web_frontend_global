import type { Session, } from "neo4j-driver";
import type { Transaction } from "neo4j-driver";

import { v4 as uuidv4 } from "uuid";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriverWithPort } from "~/cypher/driver";

export async function createUserInSuperDB(
  superTx: Transaction,
  username: string,
  email: string,
  password: string,
  subdomain: string,
  driverPort: number,
  logsPort: number,
  labPort: number,
) {
  const uuid = uuidv4();

  const createUserQuery = `CREATE (u:User {
            username: $username,
            uuid: $uuid,
            email: $email,
            subdomain: $subdomain,
            driverPort: $driverPort,
            logsPort: $logsPort,
            password: $password,
            labPort: $labPort
        }) SET u.createdAt = localDateTime() RETURN u;`;

  const createUserParams = {
    driverPort,
    email,
    labPort,
    logsPort,
    password,
    subdomain,
    username,
    uuid,
  };

  const createUserResult = await superTx.run(createUserQuery, createUserParams);
  const userSession = (await getDriverWithPort(driverPort)).session();
  await createUserInUserDB(userSession, createUserParams, true);
  userSession.close();
  return convertNodeToJson(createUserResult.records[0].get("u"));
}

export async function createUserInUserDB(
  sessionOrTx: Session | Transaction,
  params: { [key: string]: any },
  isSuper?: boolean,
) {
  const createUserQuery2 = `CREATE (u:User {
                username: 'superadmin',
                uuid: $uuid,
                email: $email,
                isSuper: $isSuper,
                avatar: ''
            }) SET u.createdAt = localDateTime() RETURN u;`;
  const createUserResult = await sessionOrTx.run(createUserQuery2, { ...params, isSuper: isSuper ?? null });
  return convertNodeToJson(createUserResult.records[0].get("u"));
}
