export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  // Full URL or Data URL (Base64) — return as-is
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Relative path: resolve via Vite proxy (dev) or same origin (prod)
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return cleanUrl;
};
