import Docker from "dockerode";

export async function removeDockerContainer(
  containerId: string,
): Promise<{ error?: string, message?: string }> {
  const docker = new Docker();

  try {
    await docker.getContainer(containerId).remove();
    return {
      message: `Docker container ${containerId} removed successfully`,
    };
  } catch (error: any) {
    return {
      error: `Failed to remove Docker container ${containerId}: ${error.message}`,
    };
  }
}
