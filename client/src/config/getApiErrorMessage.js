export const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

  if (typeof data === 'object' && data?.message) return data.message;
  if (typeof data === 'string') {
    const line = data.replace(/^Error:\s*/, '').split('\n')[0].trim();
    if (line) return line;
  }

  return fallback;
};
