const normalizeEmail = (email) => email?.trim().toLowerCase() ?? "";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = async (User, email) => {
  const trimmed = email?.trim();
  if (!trimmed) return null;

  const byNormalized = await User.findOne({ email: normalizeEmail(trimmed) });
  if (byNormalized) return byNormalized;

  return User.findOne({
    email: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, "i") },
  });
};

module.exports = { normalizeEmail, findUserByEmail };
