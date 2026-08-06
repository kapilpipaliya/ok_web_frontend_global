import type { Session } from "neo4j-driver";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { deleteFileDiskArtifacts } from "~/lib/files/deleteFileDiskArtifacts";
import { deleteFileMetadata } from "~/routes/api/file/functions/functions/deleteFileMetadata";
import { getFileMetadataById } from "~/routes/api/file/functions/functions/getFileMetadataById";
import type { Vertex } from "~/lib/graph/type/vertex";
import { cancelMediaOptimizationJob } from "~/server/queue/mediaOptimizationQueue";

export async function deleteFile(
  fileId: string,
  neo4jSession: Session,
  user: Vertex,
) {
  const fileMetadata = await getFileMetadataById(neo4jSession, fileId);

  if (!fileMetadata) {
    return new Response(JSON.stringify({ error: "File not found" }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }

  try {
    const subDomain =
      fileMetadata.P?.subDomain != null
        ? String(fileMetadata.P.subDomain)
        : "";
    if (subDomain) {
      await cancelMediaOptimizationJob(subDomain, fileId);
    }

    const deletedFileResult = await deleteFileMetadata(neo4jSession, fileId);

    if (deletedFileResult?.success) {
      await deleteFileDiskArtifacts(fileMetadata.P);

      await createActivityLog(
        neo4jSession,
        "file_delete",
        "File",
        fileId as string,
        user.P.email,
        `File deleted: ${fileMetadata.P.fileName} (${fileMetadata.P.mimeType || fileMetadata.P.contentType || ""})`,
      );
    }
    return deletedFileResult;
  } catch (error) {
    return {
      error: `Error deleting file ${error instanceof Error ? error.message : String(error)}`,
      success: false,
    };
  }
}
