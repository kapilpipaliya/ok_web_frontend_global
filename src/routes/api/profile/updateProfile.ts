import type { Session } from "neo4j-driver";

// import { getDriver } from "~/cypher/driver";
import { getHttpsSession } from "~/server/getHttpsSession";

export async function updateProfile(payload: any, dbSession: Session) {
  const { email, profileImage, username, uuid } = payload;

  // Ensure user exists
  const userExists = await dbSession.run(
    "MATCH (u:User) WHERE u.uuid = $uuid RETURN u;",
    { uuid },
  );
  if (userExists.records.length === 0) {
    return { error: "User not exists", status: 404 };
  }

  const oldUser = userExists.records[0].get("u");

  // Check if email and username already exists (excluding current user)
  if (email && email !== oldUser.properties.email) {
    const emailExists = await dbSession.run(
      "MATCH (u:User {email: $email}) WHERE u.uuid <> $uuid RETURN u;",
      { email, uuid },
    );
    if (emailExists.records.length > 0) {
      return { error: "Email address already exists", status: 500 };
    }
  }
  if (username && username !== oldUser.properties.username) {
    const usernameExists = await dbSession.run(
      "MATCH (u:User {username: $username}) WHERE u.uuid <> $uuid RETURN u;",
      { username, uuid },
    );
    if (usernameExists.records.length > 0) {
      return { error: "Username already exists", status: 500 };
    }
  }

  let basicQuery = "MATCH (u:User) WHERE u.uuid = $uuid ";
  const updates = [];
  if (email) {
    updates.push("u.email = $email");
  }
  if (username) {
    updates.push("u.username = $username");
  }
  
  if (updates.length > 0) {
    basicQuery += `SET ${updates.join(", ")}, u.updatedAt = localDateTime() RETURN u`;
  } else {
    basicQuery += "RETURN u";
  }

  const basicResult = await dbSession.run(basicQuery, {
    email,
    username,
    uuid,
  });

  if (basicResult.records.length === 0) {
    return { error: "Failed to update profile", status: 500 };
  }

  const user = basicResult.records[0].get("u");

  // Handle profile image update in separate query
  if (profileImage) {
    await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       MATCH (f:File) WHERE elementId(f) = $profileImage
       MERGE (u)-[:UserProfileImage]->(f)
       RETURN u`,
      { profileImage, uuid }
    );
  }

  // Update in subdomain database
  // const dbSession2 = (await getDriver()).session({
  //   database: user.properties.subDomain,
  // });

  // // Update basic info in subdomain
  // await dbSession2.run(basicQuery, {
  //   email,
  //   username,
  //   uuid,
  // });

  if (email) {
    const http_session = await getHttpsSession();
    await http_session.update((oldData) => ({
      ...oldData,
      email: user.properties.email,
    }));
  }

  return { message: "Profile updated successfully", user: user.properties };
}
