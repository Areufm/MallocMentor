import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api/handler";
import { ApiError } from "@/lib/utils/api-error";

/**
 * PATCH /api/user/update
 * 更新当前用户的资料或密码
 *
 * Body (profile update):  { name, image }
 * Body (password update): { currentPassword, newPassword }
 */
export const PATCH = withAuth(async ({ userId, req }) => {
  const body = await req.json();

  // --- 修改密码 ---
  if (body.currentPassword !== undefined || body.newPassword !== undefined) {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "请提供当前密码和新密码");
    }

    if ((newPassword as string).length < 6) {
      throw new ApiError(400, "新密码长度不能少于 6 位");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      throw new ApiError(400, "该账号不支持密码修改");
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new ApiError(400, "当前密码错误");
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return NextResponse.json({ success: true, message: "密码已更新" });
  }

  // --- 修改资料（昵称 / 头像） ---
  const updates: { name?: string; image?: string } = {};

  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (!trimmed) {
      throw new ApiError(400, "昵称不能为空");
    }
    if (trimmed.length > 20) {
      throw new ApiError(400, "昵称长度不能超过 20 个字符");
    }
    updates.name = trimmed;
  }

  if (typeof body.image === "string") {
    updates.image = body.image;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "没有可更新的内容");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json({ success: true, data: updated });
});
