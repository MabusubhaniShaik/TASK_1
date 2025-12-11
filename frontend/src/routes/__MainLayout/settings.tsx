import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__MainLayout/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/__MainLayout/settings"!</div>;
}
