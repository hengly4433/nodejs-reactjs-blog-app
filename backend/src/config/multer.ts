// src/config/multer.ts
import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// 1) Directory where uploaded post images will be stored.
const UPLOAD_DIR = path.resolve(__dirname, '../uploads/posts');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 2) Configure storage: destination and filename
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // cb expects (err: Error, destination: string). Pass `undefined as any` for “no error.”
    cb(undefined as any, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}_${Date.now()}${ext}`;
    // Again, first argument must be Error. Pass `undefined as any` for “no error.”
    cb(undefined as any, uniqueName);
  },
});

// 3) File filter: only accept JPEG/PNG
const imageFileFilter: multer.Options['fileFilter'] = (
  _req: Request,
  file: Express.Multer.File,
  cb  // This is Multer’s FileFilterCallback signature
) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    // No error, accept the file
    cb(undefined as any, true);
  } else {
    // Fatal error: reject upload due to invalid mimetype
    cb(new Error('Invalid file type. Only JPEG and PNG image formats are allowed.'));
  }
};

// 4) Maximum file size (5 MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 5) Export the configured Multer instance
export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
