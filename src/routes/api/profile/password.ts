import type {Session} from "neo4j-driver";

export async function password(payload: any, session: Session) {
  const {currentPassword, newPassword, username} = payload;

  const findUserQuery = "MATCH (u:User) WHERE u.password = $password AND u.username = $username RETURN u;";
  const findUserResult = await session.run(findUserQuery, {
    password: currentPassword,
    username: username,
  });
  if (findUserResult.records.length === 0) {
    return {error: "Current Password is not valid"};
  }

  const query = "MATCH (u:User) WHERE u.username = $username SET u.password = $password RETURN u;";
  const result = await session.run(query, {
    password: newPassword,
    username: username,
  });
  if (result.records.length === 0) {
    return {error: "Failed to update password"};
  }
  return {
    message: "Password updated successfully",
  };
}