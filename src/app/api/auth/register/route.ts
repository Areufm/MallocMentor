import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "请提供完整的注册信息" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "该邮箱已被注册" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
      select: { id: true, email: true, name: true, image: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 },
    );
  }
}
