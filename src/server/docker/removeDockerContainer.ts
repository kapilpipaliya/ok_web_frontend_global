import fetch from "node-fetch";
import {Agent} from "node:http";
export async function removeDockerContainer(
  containerId: string,
): Promise<{ error: boolean; message: string }> {
  const url = `http://localhost/containers/${containerId}`;
  // Custom agent for Unix socket
  const socketPath = "/var/run/docker.sock";
  const agent = new Agent({ socketPath });
  const options = {
    method: "DELETE",
    headers: {"Content-Type": "application/json"},
    agent,
  };
  try {
    const response = await fetch(url, options);
    const data: any = await response.json();

    if (!response.ok) {
      return {
        error: false,
        message: data.message || "Failed to remove container",
      };
    }
    return {
      error: false,
      message: `Docker container ${containerId} removed successfully`,
    };
  } catch (error: any) {
    return {
      error: false,
      message: `Failed to remove Docker container ${containerId}: ${error.message}`,
    };
  }
}