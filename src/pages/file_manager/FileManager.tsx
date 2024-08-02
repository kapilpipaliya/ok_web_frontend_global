import { FileManagerStoreProvider } from './FileManagerContext';
import { MainContent } from './main_content/MainContent';
import { Sidebar } from './sidebar/FileManagerSideBar';

export default function FileManager() {
  return (
    <FileManagerStoreProvider>
      <div class="w-full flex">
        <Sidebar />
        <MainContent />
      </div>
    </FileManagerStoreProvider>
  );
}
