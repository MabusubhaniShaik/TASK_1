import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__MainLayout/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__MainLayout/dashboard"!</div>
}
