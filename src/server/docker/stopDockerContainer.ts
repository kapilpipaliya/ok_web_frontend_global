import Docker from "dockerode";

export async function stopDockerContainer(
  containerId: string,
): Promise<{ error?: string; message?: string }> {
  const docker = new Docker();

  try {
    await docker.getContainer(containerId).stop();
    return {
      message: `Docker container ${containerId} stopped successfully`,
    };
  } catch (error: any) {
    return {
      error: `Failed to stop Docker container ${containerId}: ${error.message}`,
    };
  }
}
