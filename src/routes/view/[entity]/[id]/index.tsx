import { createStore } from "solid-js/store";
import { IFormContext } from "~/lib/Utils";
import { PageConfigContext } from "~/lib/contexts";
import { ContentDragAndDrop } from "~/pages/drag-drop/Layout/Content-DragAndDrop";

export default function Default() {
  return (
    <>
      <ContentDragAndDrop view={() => "Tablet"} />
    </>
  );
}
