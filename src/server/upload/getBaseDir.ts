import os from "node:os";
export function getBaseDir() {
  return os.platform() === "win32" ? "C:\\UploadFiles" : "/var/UploadFiles";
}
