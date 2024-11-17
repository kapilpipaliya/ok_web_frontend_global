import { getRequestURL } from "vinxi/http";

import { getDriver } from "~/cypher/driver";
import { removeDockerComposeDirectory } from "~/server/docker_compose/remove";
import { getSubDomain } from "~/server/getSubDomain";

// unused function, To be used in the future
// WIP
export async function deleteUserAndDatabase(userName: string) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);

  const dbSessionSource = (await getDriver(subDomain)).session();
  const subDomainForUser = subDomain + "-user"; // TODO Fix this

  try {
    const removeDockerComposeRes = await removeDockerComposeDirectory(subDomainForUser);
    if (!removeDockerComposeRes) {
      return {
          error: false,
          message: "Docker Removed successfully",
      };
    }
    
    // TODO: delete user from super user database too
    return {
      error: false,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      error: "Error deleting user",
    };
  } finally {
    await dbSessionSource.close();
  }
}
