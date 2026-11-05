import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'cgy53fmm',
  api_key: process.env.CLOUDINARY_API_KEY || '765941666727411',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'fLAW1C_XUCAyMGPL6susywCgECY',
  secure: true
});

/**
 * Upload a file buffer or stream directly to Cloudinary
 * @param {Buffer} buffer File buffer
 * @param {Object} options Upload options (folder, resource_type, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
export function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'connect_invest_documents',
        resource_type: 'auto',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export default cloudinary;

