/**
 * SCALEABLE FILE STORAGE ADAPTER
 * Standardizes file uploads across the platform.
 * Currently supports Base64 (Local/Vercel) but architected for Cloudinary/AWS S3 integration.
 */

export async function uploadFile(file: File | Blob | string, path: string): Promise<string> {
  // If it's already a URL, return it
  if (typeof file === 'string' && (file.startsWith('http') || file.startsWith('data:'))) {
    return file;
  }

  // Handle File objects (Client-side usage or server-side multipart)
  if (file instanceof File || file instanceof Blob) {
     // For production hardening, we would integrate Cloudinary/S3 here.
     // For now, we convert to Base64 to maintain zero-dependency local storage.
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = () => resolve(reader.result as string);
       reader.onerror = reject;
       reader.readAsDataURL(file);
     });
  }

  throw new Error("Unsupported file format for storage adapter.");
}

/**
 * Validation utility for professional file handling
 */
export function validateUpload(file: File, options: { maxSizeMB?: number, allowedTypes?: string[] } = {}) {
  const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip'] } = options;

  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File too large. Maximum allowed size is ${maxSizeMB}MB.`);
  }

  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.zip')) {
    throw new Error(`Invalid file type. Allowed formats: ${allowedTypes.join(', ')}`);
  }

  return true;
}
