import { Router } from "express";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { requireAuth, requireSeller } from "../middleware/auth.js";

const router = Router();
const uploadDirectory = fileURLToPath(new URL("../uploads/", import.meta.url));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      const error = new Error("Choose a JPG, PNG, or WebP image");
      error.status = 400;
      callback(error);
      return;
    }
    callback(null, true);
  },
});

function extensionFor(buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return ".jpg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ".png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return ".webp";
  return null;
}

router.post("/", requireAuth, requireSeller, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Choose an image to upload" });
    const extension = extensionFor(req.file.buffer);
    if (!extension) return res.status(400).json({ message: "The selected file is not a supported image" });
    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDirectory, filename), req.file.buffer, { flag: "wx" });
    res.status(201).json({ image: `/uploads/${filename}` });
  } catch (error) { next(error); }
});

export default router;
