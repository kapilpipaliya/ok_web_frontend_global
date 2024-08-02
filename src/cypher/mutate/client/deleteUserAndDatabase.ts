import { getRequestURL } from "vinxi/http";

import { getDriver } from "~/cypher/driver";
import { removeDockerContainer } from "~/server/docker/removeDockerContainer";
import { stopDockerContainer } from "~/server/docker/stopDockerContainer";
import { getSubDomain } from "~/server/getSubDomain";

// unused function, To be used in the future
// WIP
export async function deleteUserAndDatabase(userName: string) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);

  const sessionSource = (await getDriver(subDomain)).session();

  try {
    const stopDockerRes = await stopDockerContainer(userName);
    if (!stopDockerRes.error) {
      const removeDockerRes = await removeDockerContainer(userName);
      if (!removeDockerRes.error) {
        return {
          error: false,
          message: "Docker Removed successfully",
        };
      }
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
    await sessionSource.close();
  }
}
