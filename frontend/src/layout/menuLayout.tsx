// src/components/layout/MenuLayout.tsx
import {
  Home,
  Boxes,
  Users,
  FileText,
  Wrench,
  Wallet,
  BarChart3,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useRouterState } from "@tanstack/react-router";
import "./MenuLayout.css";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    badge: "3",
  },
  {
    title: "Inventory Management",
    url: "/inventory",
    icon: Boxes,
  },
  {
    title: "Customer Management",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Sales Management",
    url: "/sales",
    icon: FileText,
    badge: "5",
  },
  {
    title: "Service Management",
    url: "/service",
    icon: Wrench,
  },
  {
    title: "Finance & Accounting",
    url: "/finance",
    icon: Wallet,
  },
  {
    title: "Reporting & Analytics",
    url: "/reports",
    icon: BarChart3,
  },
];

export default function MenuLayout() {
  const { state } = useSidebar();
  const router = useRouterState();

  const getActivePath = () => {
    return router.location.pathname;
  };

  const isActive = (path: string) => {
    const currentPath = getActivePath();
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  return (
    <Sidebar collapsible="icon" className="bg-sidebar">
      {/* Sidebar Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold text-[0.7rem]">DMS</span>
            </div>
            {state === "expanded" && (
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-sidebar-foreground truncate max-w-[8rem] text-[1rem]">
                  Dealer Portal
                </span>

                <span className="text-xs text-muted-foreground">v2.1.0</span>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {/* Removed Search Bar as requested */}

        <SidebarSeparator className="bg-sidebar-border" />

        {/* Navigation Menu */}
        <SidebarMenu>
          {menuItems.map((item: any, index: number) => {
            const active = isActive(item.url);

            return (
              <SidebarMenuItem key={index}>
                <Link to={item.url} className="block w-full">
                  <SidebarMenuButton
                    tooltip={state === "collapsed" ? item.title : undefined}
                    isActive={active}
                    className={`
              w-full justify-start gap-3 transition-all duration-200
              menu-item-text text-sm
              ${
                active
                  ? "menu-item-active-light dark:menu-item-active-dark"
                  : "menu-item-hover"
              }
            `}
                  >
                    {/* Icon */}
                    <div className="relative flex items-center">
                      <item.icon className="h-4 w-4 flex-shrink-0 menu-item-icon" />
                    </div>

                    {/* Label + Badge */}
                    {state === "expanded" && (
                      <>
                        <span className="flex-1 truncate menu-item-text text-xs">
                          {item.title}
                        </span>

                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer with User Info */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-sidebar-border">
            <AvatarImage src="/avatar.png" alt="User" />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
              DM
            </AvatarFallback>
          </Avatar>
          {state === "expanded" && (
            <>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-sm font-medium truncate text-sidebar-foreground">
                  Dealer Manager
                </span>
                <span className="text-xs truncate text-muted-foreground">
                  admin@dealership.com
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>

      {/* Sidebar Rail for dragging */}
      <SidebarRail />
    </Sidebar>
  );
}
