const API_BASE = process.env.REACT_APP_API_URL || '';

export const resolveFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return API_BASE ? `${API_BASE.replace(/\/$/, '')}${path}` : path;
};

export const getDownloadUrl = (url, fileName) => {
  const base = resolveFileUrl(url);
  if (!base) return null;
  const params = new URLSearchParams({ download: '1' });
  if (fileName) params.set('name', fileName);
  return `${base}${base.includes('?') ? '&' : '?'}${params.toString()}`;
};

export const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
