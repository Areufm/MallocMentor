import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { withAuth } from "@/lib/api/handler";
import { ApiError } from "@/lib/utils/api-error";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

/**
 * POST /api/upload
 * 上传用户头像到本地 public/uploads/avatars/
 */
export const POST = withAuth(async ({ userId, req }) => {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new ApiError(400, "未选择文件");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError(400, "仅支持 JPG、PNG、WebP 格式图片");
  }

  if (file.size > MAX_SIZE) {
    throw new ApiError(400, "图片大小不能超过 2MB");
  }

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  // 文件名使用用户 ID + 时间戳保证唯一性，并避免覆盖他人文件
  const filename = `${userId}-${Date.now()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const url = `/uploads/avatars/${filename}`;
  return NextResponse.json({ success: true, data: { url } }, { status: 200 });
});
