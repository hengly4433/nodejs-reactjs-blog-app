// src/config/multer.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 1) We want Multer to write into `<projectRoot>/uploads/posts`
 *    at runtime.  In Docker, `process.cwd()` === '/app', so:
 *      path.resolve(process.cwd(), 'uploads', 'posts')
 *    becomes '/app/uploads/posts'.
 */
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'posts');

// If that directory doesn’t exist yet, create it (including any parent folders).
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * 2) Configure Multer’s diskStorage so that every file goes to UPLOAD_DIR,
 *    and gets a UUID + timestamp‐based name.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // First argument is `error` (null = no error), second is destination path.
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Keep the original extension (e.g. ".jpg" or ".png")
    const ext = path.extname(file.originalname);
    // Build a unique name: <uuid>_<timestamp><ext>
    const uniqueName = `${uuidv4()}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * 3) Only accept JPEG or PNG.  If the mimetype is anything else, reject.
 */
const imageFileFilter: multer.Options['fileFilter'] = (
  _req: Request,
  file: Express.Multer.File,
  cb  // Multer’s FileFilterCallback
) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG formats are allowed.'));
  }
};

/**
 * 4) Limit file size to 5 MB.  If a larger file is uploaded, Multer will throw a "LIMIT_FILE_SIZE" error.
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * 5) Export the configured Multer middleware.  Use
 *      upload.single('image')
 *    for any route that expects exactly one file under the field name "image".
 */
export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
