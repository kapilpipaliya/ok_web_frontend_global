// Function to save file to disk
import fs from "node:fs";
import path from "node:path";

export function saveFileToDisk(directory: string, filename: string, data: Buffer) {
  const filePath = path.join(directory, filename);
  fs.writeFileSync(filePath, data);
  return filePath;
}