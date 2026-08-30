import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

/**
 * Upload a buffer (or a data URI) to Cloudinary and return the secure URL.
 * Falls back to returning null when Cloudinary is not configured.
 */
export async function uploadImage(
  buffer: Buffer,
  folder = 'truetaste'
): Promise<string | null> {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    console.warn('[cloudinary] not configured, skipping upload');
    return null;
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url ?? null);
      }
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!env.cloudinary.cloudName) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[cloudinary] delete failed:', err);
  }
}