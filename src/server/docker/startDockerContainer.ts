// @ts-ignore
import Docker from 'dockerode';

export async function startDockerContainer(containerId: string): Promise<{ error: boolean; message: string }> {
  const docker = new Docker();

  try {
    await docker.getContainer(containerId).start();
    return {
      error: false,
      message: `Docker container ${containerId} started successfully`,
    };
  } catch (error: any) {
    return {
      error: true,
      message: `Failed to start Docker container ${containerId}: ${error.message}`,
    };
  }
}