const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'];

export const isSupportedImage = (file) => {
  if (!file) return false;

  if (ALLOWED_IMAGE_TYPES.has(file.type) || file.type.startsWith('image/')) {
    return true;
  }

  const ext = file.name?.toLowerCase().match(/\.[^.]+$/)?.[0];
  return ALLOWED_EXTENSIONS.includes(ext);
};

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
  });
