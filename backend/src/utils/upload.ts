import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic"];

// Multi-driver storage: Local filesystem with Cloudinary / S3 public URL resolver
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, WEBP or HEIC images are allowed"));
  }
  cb(null, true);
}

export const photoUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
});

export function fileToPublicUrl(filename: string): string {
  // If S3 / Cloudinary CDN configured in environment, point to CDN base URL
  if (process.env.STORAGE_CDN_URL) {
    return `${process.env.STORAGE_CDN_URL.replace(/\/$/, "")}/${filename}`;
  }
  return `/uploads/${filename}`;
}
