// For executing child processes
import { exec } from "child_process";

import fetch from "node-fetch";
// For HTTP agents
import { Agent } from "http";

// Docker API Reference: https://docs.docker.com/engine/api/v1.24/

const AUTH_TOKEN = "your_secret_super"; // Replace with your actual secret token

interface Container {
  id: string;
  name: string;
  status: string;
  image: string;
  age: string;
  ports: Array<{ PrivatePort: number; PublicPort: number; Type: string }>;
}

export function listDockerContainers(): Promise<Container[]> {
  return new Promise((resolve, reject) => {
    exec(
      "curl --unix-socket /var/run/docker.sock http://localhost/containers/json?all=true",
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          try {
            const containers = JSON.parse(stdout);
            const containerList = containers.map((container: any) => ({
              id: container.Id,
              name: container.Names[0], // Assuming you want the first name
              status: container.State,
              image: container.Image,
              age: container.Status,
              ports: container.Ports,
            }));
            resolve(containerList);
          } catch (parseErr) {
            reject(parseErr);
          }
        }
      },
    );
  });
}

type Callback<T> = (error: Error | null, result?: T) => void;

function startDockerContainer(containerId: string, callback: Callback<string>) {
  exec(
    `curl --unix-socket /var/run/docker.sock -X POST http://localhost/containers/${containerId}/start`,
    (err, stdout, stderr) => {
      if (err) {
        return callback(err);
      } else {
        return callback(
          null,
          `Docker container ${containerId} started successfully`,
        );
      }
    },
  );
}

// Custom agent for Unix socket
const socketPath = "/var/run/docker.sock";
const agent = new Agent({ socketPath });

function pullImageFromRegistry(imageName: string, callback: Callback<string>) {
  try {
    exec(
      `curl --unix-socket /var/run/docker.sock -X POST http://localhost/images/create?fromImage=${imageName} --max-time 20`,
      (err, stdout, stderr) => {
        if (err) {
          return callback(err);
        } else {
          const response = stdout;
          if (response.includes("pull access denied for")) {
            return callback(
              null,
              `Pull access denied for Docker image ${imageName} ,please provide correct  repository `,
            );
          } else {
            return callback(
              null,
              `Docker image ${imageName} pulled successfully ,please click create button to create container`,
            );
          }
        }
      },
    );
  } catch (error) {
    console.error("Error pulling image:", error);
  }
}

export async function stopDockerContainer(containerId: string): Promise<{ error: boolean; message: string }> {

  const url = `http://localhost/containers/${containerId}/stop`;
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ containerId: containerId }),
    agent,
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return {
        error: false,
        message: data.message || "Failed to create container"
      };
    }

    return {
      error: false,
      message: `Docker container ${containerId} stopped successfully`
    };
  } catch (error: any) {
    return {
      error: false,
      message: `Failed to stop Docker container ${containerId}: ${error.message}`
    };
  } 
}

export async function removeDockerContainer(containerId: string): Promise<{ error: boolean; message: string }> {

  const url = `http://localhost/containers/${containerId}`;
  const options = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    agent,
  };
  try {   
    const response = await fetch(url, options);
    const data: any = await response.json();

    if (!response.ok) {
      return {
        error: false,
        message: data.message || "Failed to remove container"
      };
    }
    return {
      error: false,
      message: `Docker container ${containerId} removed successfully`
    };

  } catch (error: any) {
    return {
      error: false,
      message: `Failed to remove Docker container ${containerId}: ${error.message}`
    };
  }
}

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
  let ExposedPorts: any = {};
  if (portBindings) {
    const formattedPortBindings: any = {};
    for (const [externalPort, internalPort] of Object.entries(portBindings)) {
      formattedPortBindings[`${internalPort}/tcp`] = [
        { HostIp: "localhost", HostPort: externalPort },
      ];
      ExposedPorts[`${internalPort}/tcp`] = {};
    }
    hostConfig.PortBindings = formattedPortBindings;
  }

  const url = `http://localhost/containers/create?name=${name}`;
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Image, HostConfig: hostConfig, ExposedPorts }),
    agent,
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return Error(data.message || "Failed to create container");
    }
    const { Id: containerId } = data;

    startDockerContainer(containerId, (err, message) => {
      if (err) {
        console.error(err);
        throw Error(err.message);
      } else {
        return { message };
      }
    });
    return { data };
  } catch (error: any) {
    throw Error(error.message, {});
  }
}