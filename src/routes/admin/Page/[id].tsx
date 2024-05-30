import LayoutDragAndDrop from "~/pages/drag-drop/Layout/Layout-DragAndDrop";
import PageDesignerContext from "~/pages/utils/PageDesignerContext";

export default function Page() {
  return (
    
    <PageDesignerContext>
      <LayoutDragAndDrop />
    </PageDesignerContext>
      
  );
}
