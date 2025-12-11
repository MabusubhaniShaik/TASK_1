import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__MainLayout/reports')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__MainLayout/reports"!</div>
}
