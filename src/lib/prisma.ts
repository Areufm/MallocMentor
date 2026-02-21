import { PrismaClient } from "../generated/prisma/client"; //引入生成客户端代码
import { PrismaPg } from "@prisma/adapter-pg"; //引入适配器
const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL }); //创建连接池
const prisma = new PrismaClient({ adapter: pool }); //创建客户端
export default prisma; //导出客户端
