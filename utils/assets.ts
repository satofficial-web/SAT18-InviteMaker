// utils/assets.ts
import { db } from '../db';

const MAX_IMAGE_DIMENSION = 1500; // px

/**
 * Resizes an image file to a maximum dimension, maintaining aspect ratio.
 * @param file The original image file.
 * @returns A promise that resolves to the resized image as a Blob.
 */
function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_IMAGE_DIMENSION) {
            height = Math.round(height * (MAX_IMAGE_DIMENSION / width));
            width = MAX_IMAGE_DIMENSION;
          }
        } else {
          if (height > MAX_IMAGE_DIMENSION) {
            width = Math.round(width * (MAX_IMAGE_DIMENSION / height));
            height = MAX_IMAGE_DIMENSION;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        }, file.type, 0.9); // 90% quality
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Saves an image file as a resized Blob in the assets table.
 * @param projectId The ID of the project this asset belongs to.
 * @param file The image file to save.
 * @returns The ID of the newly created asset.
 */
export async function saveImageAsAsset(projectId: number, file: File): Promise<number> {
  const resizedBlob = await resizeImage(file);
  const assetId = await db.assets.add({
    projectId,
    blob: resizedBlob,
  });
  return assetId;
}
