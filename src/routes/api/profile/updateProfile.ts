import type { Session } from "neo4j-driver";

import { getDriver } from "~/cypher/driver";
import { getHttpsSession } from "~/server/getHttpsSession";

export async function updateProfile(
  payload: any,
  dbSession: Session,
  _subdomain: string,
) {
  const { email, profileImage, userId, username, uuid } = payload;

  // Ensure user exists
  const userExists = await dbSession.run(
    "MATCH (u:User) WHERE u.uuid = $uuid RETURN u;",
    { uuid },
  );
  if (userExists.records.length === 0) {
    return { error: "User not exists", status: 404 };
  }

  // Check if email and username already exists
  if (email) {
    const emailExists = await dbSession.run(
      "MATCH (u:User {email: $email}) RETURN u;",
      { email },
    );
    if (emailExists.records.length > 0) {
      return { error: "Email address already exists", status: 500 };
    }
  }
  if (username) {
    const usernameExists = await dbSession.run(
      "MATCH (u:User {username: $username}) RETURN u;",
      { username },
    );
    if (usernameExists.records.length > 0) {
      return { error: "Username already exists", status: 500 };
    }
  }

  // Update user profile
  let query = "MATCH (u:User) WHERE u.uuid = $uuid SET ";
  const updates = [];
  if (email) {
    updates.push("u.email = $email");
  }
  if (username) {
    updates.push("u.username = $username");
  }
  if (profileImage) {
    updates.push("u.profileImage = $profileImage");
  }
  query += `${updates.join(", ")} SET u.updatedAt = localDateTime() RETURN u;`;

  const result = await dbSession.run(query, {
    email,
    profileImage,
    userId,
    username,
    uuid,
  });
  const user = result.records[0]?.get("u");

  // need to verify:
  const dbSession2 = (
    await getDriver()
  ).session({database: user.properties.subDomain});
  await dbSession2.run(query, {
    email,
    profileImage,
    userId,
    username,
    uuid,
  });

  if (email) {
    const http_session = await getHttpsSession();
    await http_session.update((oldData) => ({
      ...oldData,
      email: user.properties.email,
    }));
  }

  return { message: "Profile updated successfully", user: user.properties };
}
