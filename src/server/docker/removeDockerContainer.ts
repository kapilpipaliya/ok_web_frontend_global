// @ts-ignore
import Docker from "dockerode";

export async function removeDockerContainer(
  containerId: string,
): Promise<{ error: boolean; message: string }> {
  const docker = new Docker();

  try {
    await docker.getContainer(containerId).remove();
    return {
      error: false,
      message: `Docker container ${containerId} removed successfully`,
    };
  } catch (error: any) {
    return {
      error: true,
      message: `Failed to remove Docker container ${containerId}: ${error.message}`,
    };
  }
}
