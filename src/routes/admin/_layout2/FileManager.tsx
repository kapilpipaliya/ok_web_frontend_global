import { createFileRoute } from "@tanstack/solid-router";

import FileManager from "~/features/file_manager/FileManager";

export const Route = createFileRoute('/admin/_layout2/FileManager')({
  component: FileManagerPage,
})

function FileManagerPage() {
  return (
    <FileManager parentVertexLabel="Folder" toParentEdgeType="ParentFolder" />
  );
}
