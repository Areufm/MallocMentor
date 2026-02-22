import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * PATCH /api/user/update
 * 更新当前用户的资料或密码
 *
 * Body (profile update):  { name, image }
 * Body (password update): { currentPassword, newPassword }
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();

  // --- 修改密码 ---
  if (body.currentPassword !== undefined || body.newPassword !== undefined) {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "请提供当前密码和新密码" },
        { status: 400 },
      );
    }

    if ((newPassword as string).length < 6) {
      return NextResponse.json(
        { success: false, error: "新密码长度不能少于 6 位" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      return NextResponse.json(
        { success: false, error: "该账号不支持密码修改" },
        { status: 400 },
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "当前密码错误" },
        { status: 400 },
      );
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
      return NextResponse.json({ success: false, error: "昵称不能为空" }, { status: 400 });
    }
    if (trimmed.length > 20) {
      return NextResponse.json(
        { success: false, error: "昵称长度不能超过 20 个字符" },
        { status: 400 },
      );
    }
    updates.name = trimmed;
  }

  if (typeof body.image === "string") {
    updates.image = body.image;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: "没有可更新的内容" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json({ success: true, data: updated });
}
