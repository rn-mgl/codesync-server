import bcrypt from "bcryptjs";

export const hashString = async (s: string) => {
  const salt = await bcrypt.genSalt(10);

  const hash = await bcrypt.hash(s, salt);

  return hash;
};
