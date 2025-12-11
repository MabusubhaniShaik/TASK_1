// src/main.tsx
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "@/index.css";
import { routeTree } from "./routeTree.gen";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/providers/theme-provider";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Create App component with ThemeProvider and SidebarProvider
function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  );
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
