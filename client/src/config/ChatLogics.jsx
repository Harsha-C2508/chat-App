const sid = (id) => String(id ?? '');
const getSenderId = (msg) => msg?.sender?._id;

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    sid(getSenderId(messages[i + 1])) === sid(getSenderId(m)) &&
    sid(getSenderId(messages[i])) !== sid(userId)
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      sid(getSenderId(messages[i + 1])) !== sid(getSenderId(m)) &&
      sid(getSenderId(messages[i])) !== sid(userId)) ||
    (i === messages.length - 1 && sid(getSenderId(messages[i])) !== sid(userId))
  )
    return 0;
  else return "auto";
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (sid(getSenderId(messages[i + 1])) !== sid(getSenderId(m)) ||
      getSenderId(messages[i + 1]) === undefined) &&
    sid(getSenderId(messages[i])) !== sid(userId)
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    sid(getSenderId(messages[messages.length - 1])) !== sid(userId) &&
    getSenderId(messages[messages.length - 1])
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && sid(getSenderId(messages[i - 1])) === sid(getSenderId(m));
};

export const getSender = (loggedUser, users) => {
  if (!users || !Array.isArray(users)) return 'Unknown';

  const validUsers = users.filter(u => u && u._id);
  if (validUsers.length === 0) return 'Unknown';

  const other = validUsers.find(u => sid(u._id) !== sid(loggedUser?._id));
  return other?.name || validUsers[0]?.name || 'Unknown';
};

export const getSenderFull = (loggedUser, users) => {
  if (!users || !Array.isArray(users)) return null;

  const validUsers = users.filter(u => u && u._id);
  if (validUsers.length === 0) return null;

  return validUsers.find(u => sid(u._id) !== sid(loggedUser?._id)) || validUsers[0] || null;
};
