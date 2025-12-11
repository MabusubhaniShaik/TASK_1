import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__MainLayout/inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__MainLayout/inventory"!</div>
}
