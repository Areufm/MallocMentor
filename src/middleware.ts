import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// 使用 Edge-compatible 配置，不引入 Prisma
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
