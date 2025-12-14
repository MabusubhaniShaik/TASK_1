import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";

function isAuthenticated() {
  const token = sessionStorage.getItem("access_token");
  const expiresAt = sessionStorage.getItem("expires_at");

  if (!token || !expiresAt) return false;

  const expiryTime = new Date(expiresAt).getTime();
  return Date.now() < expiryTime;
}

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const isAuth = isAuthenticated();

    // If user is logged in and trying to access signin → redirect to dashboard
    if (isAuth && location.pathname === "/signin") {
      throw redirect({
        to: "/dashboard",
      });
    }

    // If user is NOT logged in and trying to access protected routes
    if (!isAuth && location.pathname !== "/signin") {
      throw redirect({
        to: "/signin",
      });
    }
  },
  component: RootLayout,
});

function RootLayout() {
  return <Outlet />;
}
