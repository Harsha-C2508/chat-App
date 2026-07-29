const sid = (id) => String(id ?? '');

const getOtherUserIds = (chat, currentUserId) => {
  if (!chat?.users) return [];
  return chat.users
    .map((u) => sid(u?._id || u))
    .filter((id) => id && id !== sid(currentUserId));
};

export const getMessageStatusInfo = (message, currentUserId, chat) => {
  const sentAt = message?.createdAt || null;
  const otherUserIds = getOtherUserIds(chat, currentUserId);

  const deliveredEntries = (message?.deliveredTo || []).filter((entry) =>
    otherUserIds.includes(sid(entry.user?._id || entry.user))
  );
  const readEntries = (message?.readBy || []).filter((entry) =>
    otherUserIds.includes(sid(entry.user?._id || entry.user))
  );

  const allDelivered = otherUserIds.length > 0 &&
    otherUserIds.every((id) => deliveredEntries.some((entry) => sid(entry.user?._id || entry.user) === id));
  const allRead = otherUserIds.length > 0 &&
    otherUserIds.every((id) => readEntries.some((entry) => sid(entry.user?._id || entry.user) === id));

  let status = 'sent';
  if (allRead) status = 'read';
  else if (allDelivered || deliveredEntries.length > 0) status = 'delivered';

  const latestDelivered = deliveredEntries.reduce((latest, entry) => {
    if (!entry.at) return latest;
    return !latest || new Date(entry.at) > new Date(latest) ? entry.at : latest;
  }, null);

  const latestRead = readEntries.reduce((latest, entry) => {
    if (!entry.at) return latest;
    return !latest || new Date(entry.at) > new Date(latest) ? entry.at : latest;
  }, null);

  return {
    status,
    sentAt,
    deliveredAt: latestDelivered,
    readAt: latestRead,
  };
};

export const formatStatusTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
