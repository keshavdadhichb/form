import imageCompression from 'browser-image-compression';

export async function compressPhoto(file: File): Promise<Blob> {
  const options = {
    maxWidthOrHeight: 1200,
    initialQuality: 0.85,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
    preserveExif: false,
  };

  const compressed = await imageCompression(file, options);
  return compressed;
}

export function createObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
