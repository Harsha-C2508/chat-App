const sid = (id) => String(id ?? '');

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    sid(messages[i + 1].sender._id) === sid(m.sender._id) &&
    sid(messages[i].sender._id) !== sid(userId)
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      sid(messages[i + 1].sender._id) !== sid(m.sender._id) &&
      sid(messages[i].sender._id) !== sid(userId)) ||
    (i === messages.length - 1 && sid(messages[i].sender._id) !== sid(userId))
  )
    return 0;
  else return "auto";
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (sid(messages[i + 1].sender._id) !== sid(m.sender._id) ||
      messages[i + 1].sender._id === undefined) &&
    sid(messages[i].sender._id) !== sid(userId)
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    sid(messages[messages.length - 1].sender._id) !== sid(userId) &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && sid(messages[i - 1].sender._id) === sid(m.sender._id);
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
