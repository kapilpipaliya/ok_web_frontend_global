import { FileManagerStoreProvider } from './FileManagerContext';
import { MainContent } from './main_content/MainContent';
import { Sidebar } from './sidebar/FileManagerSideBar';

export default function FileManager() {
  return (
    <FileManagerStoreProvider>
      <div class="grid gap:4px grid-template-columns:repeat(2,25%|calc(75%-4px))">
        <Sidebar />
        <MainContent />
      </div>
    </FileManagerStoreProvider>
  );
}
