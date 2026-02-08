import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// 全局变量用于在开发环境中保持 Prisma Client 实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 创建数据库适配器
const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "123456",
  database: "MallocMentor",
  connectionLimit: 10,
});

// 创建或复用 Prisma Client 实例
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"], // 开启查询日志,方便调试
  });

// 在开发环境中缓存实例,避免热重载时重复创建连接
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
