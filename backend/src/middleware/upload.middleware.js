'use strict';

const multer = require('multer');
const path = require('path');
const { sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880; // 5MB
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.'), {
        code: 'FILE_INVALID_TYPE',
      }),
      false
    );
  }
};

const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/**
 * Wraps multer to return standardized error responses.
 * @param {string} fieldName - Form field name for the file
 */
const upload = (fieldName) => (req, res, next) => {
  multerUpload.single(fieldName)(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(
        res, 413,
        'File too large',
        ErrorCodes.FILE_TOO_LARGE,
        'file',
        `File must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    if (err.code === 'FILE_INVALID_TYPE') {
      return sendError(
        res, 400,
        'Invalid file type',
        ErrorCodes.FILE_INVALID_TYPE,
        'file',
        err.message
      );
    }

    return sendError(
      res, 500,
      'File upload failed',
      ErrorCodes.SERVER_ERROR,
      null,
      err.message
    );
  });
};

module.exports = { upload };
