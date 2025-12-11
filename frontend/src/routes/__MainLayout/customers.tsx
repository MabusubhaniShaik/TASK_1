import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__MainLayout/customers')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__MainLayout/customers"!</div>
}
