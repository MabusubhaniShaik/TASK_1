// src/components/layout/HeaderLayout.tsx
import { Bell, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function HeaderLayout() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8" />
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vehicles, customers, orders..."
            className="pl-9 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
            3
          </Badge>
        </Button>

        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>DM</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
