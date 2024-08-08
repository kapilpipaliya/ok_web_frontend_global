import type { Session } from "neo4j-driver";
import type { TransactionPromise } from "neo4j-driver-core";

import { v4 as uuidv4 } from "uuid";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriverWithPort } from "~/cypher/driver";

export async function createUserInDB(
  superTx: TransactionPromise,
  username: string,
  email: string,
  password: string,
  subdomain: string,
  driverPort: number,
  logsPort: number,
  labPort: number,
) {
  const uId = uuidv4();

  const createUserQuery = `CREATE (u:User {
            username: $username,
            uId:$uId,
            email: $email,
            subdomain: $subdomain,
            driverPort: $driverPort,
            logsPort: $logsPort,
            labPort: $labPort,
            profileImage: ''
        }) SET u.createdAt = localDateTime() RETURN u;`;

  const createUserParams = {
    driverPort,
    email,
    labPort,
    logsPort,
    password,
    subdomain,
    uId,
    username,
  };

  const createUserResult = await superTx.run(createUserQuery, createUserParams);
  const session2 = (await getDriverWithPort(driverPort)).session();
  await createUserInUserDB(session2, createUserParams);
  session2.close();
  return convertNodeToJson(createUserResult.records[0].get("u"));
}

export async function createUserInUserDB(
  session: Session,
  params: { [key: string]: any },
) {
  const createUserQuery2 = `CREATE (u:User {
                username: $username,
                uId:$uId,
                email: $email,
                password: $password,
                profileImage: ''
            }) SET u.createdAt = localDateTime() RETURN u;`;
  const createUserResult = await session.run(createUserQuery2, params);
  return convertNodeToJson(createUserResult.records[0].get("u"));
}
