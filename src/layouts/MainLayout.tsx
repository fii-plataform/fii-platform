import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { ToastViewport } from '@/components/ui/Toast';
import { FIIFormModal } from '@/components/fii/FIIFormModal';

export function MainLayout() {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-base-950 text-ink-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onAddPosition={() => setAddModalOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
      <ToastViewport />
      <FIIFormModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
