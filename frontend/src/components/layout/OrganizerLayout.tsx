import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './SideBar';
import Header from './Header';

export default function OrganizerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F3EF]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-[#F8F3EF] p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}