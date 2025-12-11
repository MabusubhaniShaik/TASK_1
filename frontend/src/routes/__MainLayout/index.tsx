import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__MainLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/__MainLayout/"!</div>;
}
