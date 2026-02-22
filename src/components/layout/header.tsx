"use client";

import { useState } from "react";
import { Bell, Search, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "./sidebar";
import { ModeToggle } from "./mode-toggle";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const initials = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <MobileSidebar />

      <div className="flex-1">
        <form className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="搜索题目、知识点..."
            className="w-full bg-muted/50 pl-8"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />

        {/* 通知按钮 */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            3
          </span>
        </Button>

        {/* 用户头像下拉菜单（hover 展开） */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onMouseEnter={() => setOpen(true)}
            >
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "用户"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {user?.name && (
                <span className="hidden text-sm font-medium lg:inline-block">
                  {user.name}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52"
            onMouseLeave={() => setOpen(false)}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.name ?? "用户"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-4 w-4" />
              个人设置
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
