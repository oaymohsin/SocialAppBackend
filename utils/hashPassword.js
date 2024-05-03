import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
  return hashedPassword;
};
