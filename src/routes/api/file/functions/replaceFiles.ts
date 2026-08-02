import type { Session } from "neo4j-driver";

import path from "node:path";

import { processResult } from "~/cypher/conversion/processResult";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import type { EvalExpressionContext } from "~/cypher/types/EvalExpressionContext";
import { calculateChecksum } from "~/lib/files/calculateChecksum";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { getBaseDir } from "~/lib/files/getBaseDir";
import { saveFileToDisk } from "~/lib/files/saveFileToDisk";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getFileMetadataById } from "~/routes/api/file/functions/functions/getFileMetadataById";
import { saveFileMetadata } from "~/routes/api/file/functions/functions/saveFileMetadata";

export async function replaceFiles(
  request: Request,
  formData: FormData,
  neo4jSession: Session,
  subDomain: string,
  user: Vertex,
) {
  const currentDate = new Date().toISOString();
  const [year, month, day] = currentDate.split("T")[0].split("-");
  const baseDir = getBaseDir();
  const userDir = path.join(baseDir, subDomain, year, month, day);

  ensureDirectoryExists(userDir);

  const query = new URL(request.url).searchParams;
  const fileId = query.get("fileId");
  if (!fileId) {
    return { error: "fileId is required" };
  }

  const files = [...formData.values()].filter(
    (value): value is File => value instanceof File && Boolean(value.name),
  );
  if (files.length > 1) {
    return { error: "Only one file is allowed to be replaced" };
  }

  const oldFileMetadata = await getFileMetadataById(neo4jSession, fileId);
  if (!oldFileMetadata) {
    return { error: "File metadata not found for the provided fileId" };
  }

  const newFileNodes = await Promise.all(
    files.map(async (file) => {
      const { ext, name } = path.parse(file.name);
      const newVersion = (oldFileMetadata.P.version || 0) + 1;
      const newFilename = `${name}_v${newVersion}_${currentDate}${ext}`;
      const fileData = Buffer.from(await file.arrayBuffer());
      const filePath = saveFileToDisk(userDir, newFilename, fileData);
      const fileSize = fileData.length;
      const mimeType = file.type;
      const checksum = calculateChecksum(fileData);

      const newMetadata = {
        checksum,
        fileName: newFilename,
        filePath: filePath,
        fileSize,
        mimeType,
        originalFileName: file.name,
        subDomain,
        version: newVersion,
      };

      return await saveFileMetadata(neo4jSession, newMetadata, fileId);
    }),
  );

  const context: EvalExpressionContext = {
    nodes: {},
    relationships: {},
  };
  const result = processResult(
    newFileNodes.filter((node) => node !== null),
    context,
    "f",
  );
  // Log file replacement
  await createActivityLog(
    neo4jSession,
    "file_replace",
    "File",
    fileId,
    user.P.email,
    `File replaced: ${oldFileMetadata.P.fileName} -> ${files[0]?.name}`,
  );
  return {
    graph: {
      edges: context.relationships,
      vertexes: context.nodes,
    },
    result,
  };
}
