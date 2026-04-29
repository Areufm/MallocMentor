import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { withErrorBoundary } from "@/lib/api/handler";
import { ApiError } from "@/lib/utils/api-error";

export const POST = withErrorBoundary(async ({ req }) => {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    throw new ApiError(400, "请提供完整的注册信息");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "该邮箱已被注册");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword },
    select: { id: true, email: true, name: true, image: true },
  });

  return NextResponse.json({ success: true, data: user }, { status: 201 });
});
