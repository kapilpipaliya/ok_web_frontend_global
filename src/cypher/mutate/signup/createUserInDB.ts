import type { Session } from "neo4j-driver";
import type { Transaction } from "neo4j-driver";

import { v4 as uuidv4 } from "uuid";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriverWithPort } from "~/cypher/driver";

export async function createUserInSuperDB(
  superTx: Transaction,
  userData: {
    driverPort: number;
    email: string;
    labPort: number;
    logsPort: number;
    password: string;
    subDomain: string[];
    username: string;
  },
) {
  const uuid = uuidv4();

  const createUserQuery = `CREATE (u:User {
            username: $username,
            uuid: $uuid,
            email: $email,
            password: $password
        }) SET u.createdAt = localDateTime() RETURN u;`;

  const createUserParams = {
    ...userData,
    uuid,
  };

  const createUserResult = await superTx.run(createUserQuery, createUserParams);
  const userNode = createUserResult.records[0].get("u");

  for (const subDomain of userData.subDomain) {
    const createSubDomainQuery = `CREATE (s:SubDomain {
            key: $subDomain,
            driverPort: $driverPort,
            labPort: $labPort,
            logsPort: $logsPort
        }) RETURN s;`;
    const createSubDomainParams = {
      driverPort: userData.driverPort,
      labPort: userData.labPort,
      logsPort: userData.logsPort,
      subDomain,
    };
    const createSubDomainResult = await superTx.run(
      createSubDomainQuery,
      createSubDomainParams,
    );
    const _subDomainNode = createSubDomainResult.records[0].get("s");

    const createEdgeQuery = `MATCH (u:User { uuid: $uuid }), (s:SubDomain { key: $subDomain })
                             CREATE (u)-[:UserSubDomain]->(s);`;
    const createEdgeParams = { subDomain, uuid };
    await superTx.run(createEdgeQuery, createEdgeParams);
  }

  const userDbSession = (await getDriverWithPort(userData.driverPort)).session();
  await createUserInUserDB(userDbSession, createUserParams, true);
  userDbSession.close();
  return convertNodeToJson(userNode);
}

export async function createUserInUserDB(
  sessionOrTx: Session | Transaction,
  params: { [key: string]: any },
  isSuper?: boolean,
) {
  // Isnt superadmin username confusing?
  const createUserQuery2 = `CREATE (u:User {
                username: 'superadmin',
                uuid: $uuid,
                email: $email,
                isSuper: $isSuper,
                avatar: ''
            }) SET u.createdAt = localDateTime() RETURN u;`;
  const createUserResult = await sessionOrTx.run(createUserQuery2, {
    ...params,
    isSuper: isSuper ?? null,
  });
  return convertNodeToJson(createUserResult.records[0].get("u"));
}
