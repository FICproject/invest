import multer from 'multer';
import path from 'path';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Use memoryStorage so file buffer is directly streamed to Cloudinary without local disk storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG, PNG, and PDF files are allowed for document upload.'));
};

const multerInstance = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter
});

/**
 * Helper to upload a single multer file to Cloudinary and attach secure_url to file.path & file.filename
 */
async function processFileToCloudinary(file) {
  if (!file || !file.buffer) return file;
  const result = await uploadToCloudinary(file.buffer, {
    folder: 'connect_invest_documents',
    public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e6)}`
  });
  file.path = result.secure_url;
  file.secure_url = result.secure_url;
  file.filename = result.secure_url; // controllers reading file.filename get the full Cloudinary HTTPS URL
  return file;
}

/**
 * Middleware wrapper for single file upload with Cloudinary stream
 */
export function uploadSingleCloudinary(fieldName) {
  const uploadHandler = multerInstance.single(fieldName);
  return (req, res, next) => {
    uploadHandler(req, res, async err => {
      if (err) return next(err);
      try {
        if (req.file) {
          await processFileToCloudinary(req.file);
        }
        next();
      } catch (uploadErr) {
        next(uploadErr);
      }
    });
  };
}

/**
 * Middleware wrapper for array file upload with Cloudinary stream
 */
export function uploadArrayCloudinary(fieldName, maxCount = 5) {
  const uploadHandler = multerInstance.array(fieldName, maxCount);
  return (req, res, next) => {
    uploadHandler(req, res, async err => {
      if (err) return next(err);
      try {
        if (req.files && Array.isArray(req.files)) {
          await Promise.all(req.files.map(f => processFileToCloudinary(f)));
        }
        next();
      } catch (uploadErr) {
        next(uploadErr);
      }
    });
  };
}

/**
 * Middleware wrapper for fields upload with Cloudinary stream
 */
export function uploadFieldsCloudinary(fields) {
  const uploadHandler = multerInstance.fields(fields);
  return (req, res, next) => {
    uploadHandler(req, res, async err => {
      if (err) return next(err);
      try {
        if (req.files) {
          const promises = [];
          for (const key of Object.keys(req.files)) {
            const fileList = req.files[key];
            if (Array.isArray(fileList)) {
              for (const f of fileList) {
                promises.push(processFileToCloudinary(f));
              }
            }
          }
          await Promise.all(promises);
        }
        next();
      } catch (uploadErr) {
        next(uploadErr);
      }
    });
  };
}

// Preserve existing exports and API signature
export const upload = {
  single: uploadSingleCloudinary,
  array: uploadArrayCloudinary,
  fields: uploadFieldsCloudinary
};

export const uploadKycDocs = {
  fields: uploadFieldsCloudinary,
  single: uploadSingleCloudinary,
  array: uploadArrayCloudinary
};
