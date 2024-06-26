// @ts-ignore
import Docker from 'dockerode';

export async function stopDockerContainer(
  containerId: string,
): Promise<{ error: boolean; message: string }> {
  const docker = new Docker();

  try {
    await docker.getContainer(containerId).stop();
    return {
      error: false,
      message: `Docker container ${containerId} stopped successfully`,
    };
  } catch (error: any) {
    return {
      error: true,
      message: `Failed to stop Docker container ${containerId}: ${error.message}`,
    };
  }
}