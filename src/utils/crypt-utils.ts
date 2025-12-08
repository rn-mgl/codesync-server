import bcrypt from "bcryptjs";

export const hashString = async (plainString: string) => {
  const salt = await bcrypt.genSalt(10);

  const hash = await bcrypt.hash(plainString, salt);

  return hash;
};

export const verifyHash = async (plainString: string, hashedString: string) => {
  const verified = await bcrypt.compare(plainString, hashedString);

  return verified;
};
