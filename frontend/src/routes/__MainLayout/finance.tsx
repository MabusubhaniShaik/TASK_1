import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__MainLayout/finance')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__MainLayout/finance"!</div>
}
