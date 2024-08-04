import type { RowSelectionOptions } from '@tanstack/solid-table';

import type { Vertex } from '~/lib/graph/graph';

import { type FileManagerObject, FileManagerStoreProvider } from './FileManagerContext';
import { MainContent } from './main_content/MainContent';
import { Sidebar } from './sidebar/FileManagerSideBar';

export default function FileManager(props: Readonly<{
  enableRowSelection?: RowSelectionOptions<Vertex>['enableRowSelection'],
  setFileManagerStore: (fileManagerStore: FileManagerObject) => void;
}>) {
  return (
    <FileManagerStoreProvider enableRowSelection={props.enableRowSelection} setFileManagerStore={props.setFileManagerStore}>
      <div class="grid gap:4px grid-template-columns:repeat(2,20%|calc(80%-4px))">
        <Sidebar />
        <MainContent />
      </div>
    </FileManagerStoreProvider>
  );
}

// Plan:
// Preview file
// Copy file
// Copy folder

// Move File/Folder:
// On File Drag Over not possible.
// On File Drop, just change the parent.
// Root is not possible to move.

// Delete File/Folder:
// In the delete dialog, show where the file is used.
// Dont allow to delete non empty folders.
// Implement proper validations and authorization checks to ensure that user can only delete their own files and folders.

// Provide UI to replace the file.