import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { MobileMenu } from './MobileMenu';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Visível em tablet e desktop (>= 768px) */}
      <AdminSidebar />

      {/* Menu Mobile - Visível apenas em mobile (< 768px) */}
      <MobileMenu />

      <main className="flex-1 overflow-auto">
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
