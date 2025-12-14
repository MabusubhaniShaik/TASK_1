// src/routes/__MainLayout.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import MenuLayout from "@/layout/menuLayout";
import HeaderLayout from "@/layout/headerLayout";

export const Route = createFileRoute("/__MainLayout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <MenuLayout />

      {/* Right side: Header + content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderLayout />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {/* Outlet renders nested routes here */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
