import fetch from "node-fetch";
import {Agent} from "node:http";
import {startDockerContainer} from "~/server/docker/startDockerContainer";

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
        {HostIp: "localhost", HostPort: externalPort},
      ];
      ExposedPorts[`${internalPort}/tcp`] = {};
    }
    hostConfig.PortBindings = formattedPortBindings;
  }

  const url = `http://localhost/containers/create?name=${name}`;

// Custom agent for Unix socket
  const socketPath = "/var/run/docker.sock";
  const agent = new Agent({ socketPath });
  const options = {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({Image, HostConfig: hostConfig, ExposedPorts}),
    agent,
  };
  try {
    const response = await fetch(url, options);
    const data: any = await response.json();

    if (!response.ok) {
      return Error(data.message || "Failed to create container");
    }
    const {Id: containerId} = data;

    startDockerContainer(containerId, (err, message) => {
      if (err) {
        console.error(err);
        throw Error(err.message);
      }
      return {message};
    });
    return {data};
  } catch (error: any) {
    throw Error(error.message, {});
  }
}