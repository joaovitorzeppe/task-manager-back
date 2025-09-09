import { diskStorage } from "multer";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function createMulterOptions(
  subFolder: "projects" | "tasks" | "comments"
) {
  const uploadRoot = join(__dirname, "..", "public", "uploads", subFolder);
  if (!existsSync(uploadRoot)) {
    mkdirSync(uploadRoot, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadRoot),
      filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
        cb(null, `${timestamp}_${safeName}`);
      },
    }),
    fileFilter: (
      _req: any,
      file: Express.Multer.File,
      cb: (error: any, acceptFile: boolean) => void
    ) => {
      if (!ALLOWED_MIME.has(file.mimetype)) {
        return cb(null, false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  } as const;
}

export function buildPublicUrl(relativePath: string): string {
  return relativePath;
}
