import {exec} from "node:child_process";

export type Callback<T> = (error: Error | null, result?: T) => void;

export function startDockerContainer(containerId: string, callback: Callback<string>) {
  exec(
    `curl --unix-socket /var/run/docker.sock -X POST http://localhost/containers/${containerId}/start`,
    (err, stdout, stderr) => {
      if (err) {
        return callback(err);
      }
      return callback(
        null,
        `Docker container ${containerId} started successfully`,
      );
    },
  );
}