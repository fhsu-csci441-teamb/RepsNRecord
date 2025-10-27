const path = require("path");
const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const mime = require("mime-types");
const { pool } = require("./db");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg","image/png","image/webp","image/heic","image/heif"].includes(file.mimetype);
    cb(ok ? null : new Error("Unsupported file type"), ok);
  }
});

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const userId = "00000000-0000-0000-0000-000000000001"; // TODO: replace with real auth
    const { description, takenAt } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const inputMime = req.file.mimetype;
    const ext = mime.extension(inputMime) || "jpg";

    const img = sharp(req.file.buffer).rotate();
    const meta = await img.metadata();

    const id = uuidv4();
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");

    const relDir = path.join("public", "uploads", String(userId), String(yyyy), mm);
    const absDir = path.join(process.cwd(), relDir);
    await ensureDir(absDir);

    const baseName = `${id}.${ext}`;
    const thumbName = `${id}.thumb.jpg`;

    const compressed = await img
      .resize({ width: 3000, height: 3000, fit: "inside", withoutEnlargement: true })
      .toFormat(ext === "png" ? "png" : "jpeg", { quality: 85 })
      .toBuffer();

    const thumb = await img
      .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    await fs.writeFile(path.join(absDir, baseName), compressed);
    await fs.writeFile(path.join(absDir, thumbName), thumb);

    const fileUrl = `/${path.join("uploads", String(userId), String(yyyy), mm, baseName).replace(/\\/g,"/")}`;
    const thumbUrl = `/${path.join("uploads", String(userId), String(yyyy), mm, thumbName).replace(/\\/g,"/")}`;

    const taken_at = takenAt && !Number.isNaN(Date.parse(takenAt))
      ? new Date(takenAt).toISOString()
      : null;

    const insert = await pool.query(
      `INSERT INTO photos (user_id, file_url, thumb_url, mime_type, bytes, width, height, taken_at, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [userId, fileUrl, thumbUrl, inputMime, compressed.length, meta.width, meta.height, taken_at, description || null]
    );

    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: String(err.message || err) });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = "00000000-0000-0000-0000-000000000001";
    const { month } = req.query; // YYYY-MM

    let q, params;
    if (month) {
      q = `
        SELECT *
        FROM photos
        WHERE user_id = $1
          AND taken_at >= $2::timestamptz
          AND taken_at <  ($2::timestamptz + INTERVAL '1 month')
        ORDER BY taken_at NULLS LAST, created_at DESC
      `;
      params = [userId, `${month}-01`];
    } else {
      q = `
        SELECT *
        FROM photos
        WHERE user_id = $1
        ORDER BY taken_at NULLS LAST, created_at DESC
      `;
      params = [userId];
    }

    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = "00000000-0000-0000-0000-000000000001";
    const { id } = req.params;

    // Get photo info before deleting to remove files
    const { rows } = await pool.query(
      "SELECT file_url, thumb_url FROM photos WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const photo = rows[0];

    // Delete from database
    await pool.query("DELETE FROM photos WHERE id = $1 AND user_id = $2", [id, userId]);

    // Delete physical files
    try {
      const fullPath = path.join(process.cwd(), "public", photo.file_url);
      const thumbPath = path.join(process.cwd(), "public", photo.thumb_url);
      await fs.unlink(fullPath).catch(() => {});
      await fs.unlink(thumbPath).catch(() => {});
    } catch (fileErr) {
      console.error("File deletion error:", fileErr);
      // Continue even if file deletion fails
    }

    res.json({ message: "Photo deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

module.exports = router;
