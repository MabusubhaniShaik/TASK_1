// src/routes/__AuthLayout.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/__AuthLayout")({
  component: AuthLayoutComponent,
});

function AuthLayoutComponent() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold mb-4">DMS Portal</h1>
        <p className="text-lg text-gray-300 text-center">
          Welcome to the DMS Portal. Please login to continue.
        </p>
      </div>

      {/* Right Column - Outlet */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <Outlet />
      </div>
    </div>
  );
}
