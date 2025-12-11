// src/routes/__MainLayout.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import MenuLayout from "@/layout/menuLayout";
import HeaderLayout from "@/layout/headerLayout";
import { SidebarInset } from "@/components/ui/sidebar";

export const Route = createFileRoute("/__MainLayout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <MenuLayout />

      {/* Main Content Area with SidebarInset */}
      <SidebarInset>
        {/* Header */}
        <HeaderLayout />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background p-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-2">
            <span>© 2024 DMS Portal. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>Version 2.1.0</span>
              <span>•</span>
              <span>Last sync: 2 min ago</span>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </div>
  );
}
