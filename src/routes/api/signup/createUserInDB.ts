import type {TransactionPromise} from "neo4j-driver-core";
import {v4 as uuidv4} from "uuid";
import {getDriverWithPort} from "~/cypher/driver";
import type {Node} from "neo4j-driver";

export async function createUserInDB(
  tx: TransactionPromise,
  username: any,
  email: any,
  subdomainFromUrl: string,
  password: any,
  subdomain: any,
  driverPort: any,
  logsPort: any,
  labPort: any,
) {
  const uId = uuidv4();
  let user;
  // Create user in a Main database without password
  const createUserQuery = `CREATE (u:User {
            username: $username,
            uId:$uId,
            email: $email,
            password: $password,
            subdomain: $subdomain,
            driverPort: $driverPort,
            logsPort: $logsPort,
            labPort: $labPort,
            profileImage: ''
        }) SET u.createdAt = localDateTime() RETURN u;`;
  const createUserResult = await tx.run(createUserQuery, {
    username,
    uId,
    email,
    password: subdomainFromUrl === "super" ? null : password,
    subdomain,
    driverPort,
    logsPort,
    labPort,
  });

  if (subdomainFromUrl === "super") {
    // Add user in a User database with password
    const session2 = (await getDriverWithPort(driverPort)).session();
    const createUserQuery2 = `CREATE (u:User {
                username: $username,
                uId:$uId,
                email: $email,
                password: $password,
                subdomain: $subdomain,
                driverPort: $driverPort,
                logsPort: $logsPort,
                labPort: $labPort,
                profileImage: ''
            }) SET u.createdAt = localDateTime() RETURN u;`;
    await session2.run(createUserQuery2, {
      username,
      uId,
      email,
      password,
      subdomain,
      driverPort,
      logsPort,
      labPort,
    });
    session2.close();
  }

  return createUserResult.records[0].get("u") as Node;
}