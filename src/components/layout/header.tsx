"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileSidebar } from "./sidebar";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6">
      <MobileSidebar />

      <div className="flex-1">
        <form className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="搜索题目、知识点..."
            className="w-full bg-gray-50 pl-8"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "用户"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {user?.name && (
            <span className="hidden text-sm font-medium lg:inline-block">
              {user.name}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="退出登录"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
