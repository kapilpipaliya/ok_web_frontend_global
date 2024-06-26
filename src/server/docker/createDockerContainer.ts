// @ts-ignore
import Docker from 'dockerode';
import { startDockerContainer } from '~/server/docker/startDockerContainer';

// Docker API Reference: https://docs.docker.com/engine/api/v1.24/

interface PortBindings {
  [port: string]: string;
}

export async function createDockerContainer(
  Image: string,
  name: string,
  portBindings: PortBindings,
) {
  if (!Image) {
    throw Error("Image name is required");
  }

  // Preparing PortBindings for Docker
  const hostConfig: any = {};
  // For documentation purpose only
  const ExposedPorts: any = {};
  if (portBindings) {
    const formattedPortBindings: any = {};
    for (const [externalPort, internalPort] of Object.entries(portBindings)) {
      formattedPortBindings[`${internalPort}/tcp`] = [
        { HostIp: "0.0.0.0", HostPort: externalPort },
      ];
      ExposedPorts[`${internalPort}/tcp`] = {};
    }
    hostConfig.PortBindings = formattedPortBindings;
  }

  const docker = new Docker();

  try {
    const container = await docker.createContainer({
      Image,
      name,
      HostConfig: hostConfig,
      ExposedPorts,
    });

    const containerId = container.id;

    const { error, message } = await startDockerContainer(containerId);
    if (error) {
      throw Error(message);
    }

    return { data: container };
  } catch (error: any) {
    throw Error(error.message);
  }
}