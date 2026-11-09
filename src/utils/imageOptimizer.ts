/**
 * Utility for optimizing remote image URLs on mobile.
 * Appends width / sizing parameters to prevent mobile GPUs from
 * decoding 4K/2K bitmaps into RAM during list scroll.
 */
export function optimizeImageUrl(url?: string, width = 380): string {
  if (!url) return '';
  if (typeof url !== 'string') return url;

  // Shopify CDN
  if (url.includes('cdn.shopify.com')) {
    if (url.includes('width=')) {
      return url.replace(/width=\d+/, `width=${width}`);
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}`;
  }

  // Unsplash
  if (url.includes('images.unsplash.com')) {
    if (url.includes('w=')) {
      return url.replace(/w=\d+/, `w=${width}`);
    }
    return `${url}&w=${width}&auto=format&q=75`;
  }

  return url;
}
