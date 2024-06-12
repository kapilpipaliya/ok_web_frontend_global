import {Agent} from "node:http";
import fetch from "node-fetch";

export async function stopDockerContainer(
  containerId: string,
): Promise<{ error: boolean; message: string }> {
  const url = `http://localhost/containers/${containerId}/stop`;
  // Custom agent for Unix socket
  const socketPath = "/var/run/docker.sock";
  const agent = new Agent({socketPath});

  const options = {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({containerId: containerId}),
    agent,
  };
  try {
    const response = await fetch(url, options);
    const data: any = await response.json();

    if (!response.ok) {
      return {
        error: false,
        message: data.message || "Failed to create container",
      };
    }

    return {
      error: false,
      message: `Docker container ${containerId} stopped successfully`,
    };
  } catch (error: any) {
    return {
      error: false,
      message: `Failed to stop Docker container ${containerId}: ${error.message}`,
    };
  }
}