import Docker from "dockerode";

export async function startDockerContainer(
  containerId: string,
): Promise<{ error?: string; message?: string }> {
  const docker = new Docker();

  try {
    await docker.getContainer(containerId).start();
    return {
      message: `Docker container ${containerId} started successfully`,
    };
  } catch (error: any) {
    return {
      error: `Failed to start Docker container ${containerId}: ${error.message}`,
    };
  }
}
