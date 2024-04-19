import { compare, hash } from 'bcrypt';

/**
 * The function `hashPassword` takes a password as input, generates a salt, and then hashes the
 * password using the salt.
 * @param {string} password - The `password` parameter is a string that represents the user's password.
 * @returns The hashed password is being returned.
 */
export async function hashPassword(password: string) {
  const salt = 12;
  const hashedPassword = await hash(password, salt);
  return hashedPassword;
}

/**
 * The function compares a plain text password with a hashed password and returns a boolean indicating
 * whether they match.
 * @param {string} password - The `password` parameter is a string that represents the plain text
 * password that needs to be compared with the hashed password.
 * @param {string} hashedPassword - The `hashedPassword` parameter is a string that represents the
 * password that has been hashed using a cryptographic algorithm.
 * @returns the result of comparing the provided password with the hashed password.
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  const comparedPassword = await compare(password, hashedPassword);
  return comparedPassword;
}
