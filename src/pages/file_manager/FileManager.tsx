import { FileManagerStoreProvider } from './FileManagerContext';
import { MainContent } from './MainContent';
import { Sidebar } from './sidebar/SideBar';

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
