import Docker from "dockerode";

import { startDockerContainer } from "~/server/docker/startDockerContainer";

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
    let container;
    try {
      await new Promise<void>((resolve, reject) => {
        docker.pull(Image, {}, (err: Error | null, stream: NodeJS.ReadableStream | undefined) => {
          if (err) {
            return reject(err);
          }
          if (!stream) {
            return reject(new Error("No stream returned from docker.pull"));
          }
          docker.modem.followProgress(stream, onFinished, onProgress);

          function onFinished(err: Error | null, output: any) {
            if (err) {
              return reject(err);
            }
            resolve(output);
          }

          function onProgress(_event: any) {
          }
        });
      });

      container = await docker.createContainer({
        ExposedPorts,
        HostConfig: hostConfig,
        Image,
        name,
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw new Error(`No such image: ${Image}`);
      }
      throw error;
    }

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
