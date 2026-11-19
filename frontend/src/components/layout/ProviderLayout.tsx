import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import Header from './Header';

export default function ProviderLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="ye-ui ye-shell flex h-screen overflow-hidden bg-[#F8F3EF]">
      <Sidebar
        role="provider"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="ye-main flex-1 overflow-y-auto bg-[#F8F3EF] p-5 md:p-8">
          <div className="ye-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}