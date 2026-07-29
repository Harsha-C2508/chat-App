const hashKey = (userId, secret) => {
  const salt = localStorage.getItem(`halo-secret-salt-${userId}`) || '';
  let h = 0;
  const str = `${salt}:${userId}:${secret}`;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return String(h);
};

const storageHashKey = (userId) => `halo-secret-hash-${String(userId)}`;
const hiddenStorageKey = (userId) => `halo-hidden-chats-${String(userId)}`;

export const resolveUserId = (user, fallbackUser) =>
  String(user?._id || fallbackUser?._id || '');

export const hasSecretKey = (userId) =>
  Boolean(userId && localStorage.getItem(storageHashKey(userId)));

export const setSecretKey = (userId, secret) => {
  const id = String(userId || '');
  const trimmed = secret?.trim();
  if (!id || !trimmed || trimmed.length < 4) {
    throw new Error('Secret key must be at least 4 characters');
  }
  if (!localStorage.getItem(`halo-secret-salt-${id}`)) {
    localStorage.setItem(`halo-secret-salt-${id}`, `${Date.now()}-${Math.random()}`);
  }
  localStorage.setItem(storageHashKey(id), hashKey(id, trimmed));
};

export const verifySecretKey = (userId, secret) => {
  const id = String(userId || '');
  const trimmed = secret?.trim();
  if (!id || !trimmed) return false;
  const stored = localStorage.getItem(storageHashKey(id));
  if (!stored) return false;
  return stored === hashKey(id, trimmed);
};

export const removeSecretKey = (userId, secret) => {
  if (!verifySecretKey(userId, secret)) return false;
  localStorage.removeItem(storageHashKey(userId));
  localStorage.removeItem(`halo-secret-salt-${userId}`);
  localStorage.removeItem(hiddenStorageKey(userId));
  return true;
};

export const getHiddenChatIds = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(hiddenStorageKey(userId)) || '[]');
  } catch {
    return [];
  }
};

export const hideChat = (userId, chatId) => {
  const ids = getHiddenChatIds(userId);
  const id = String(chatId);
  if (!ids.includes(id)) ids.push(id);
  localStorage.setItem(hiddenStorageKey(userId), JSON.stringify(ids));
};

export const unhideChat = (userId, chatId) => {
  const id = String(chatId);
  const ids = getHiddenChatIds(userId).filter(c => c !== id);
  localStorage.setItem(hiddenStorageKey(userId), JSON.stringify(ids));
};

export const isChatHidden = (userId, chatId) =>
  getHiddenChatIds(userId).includes(String(chatId));

export const clearHiddenChat = (userId, chatId) => {
  unhideChat(userId, chatId);
};
