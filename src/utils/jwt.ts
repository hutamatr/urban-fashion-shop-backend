import jwt from 'jsonwebtoken';

export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

/**
 * The function generates a token using the provided payload, token secret, and expiration time.
 * @param {string | object | Buffer} payload - The payload parameter can be a string, an object, or a
 * Buffer. It represents the data that you want to include in the token. This data can be used to
 * identify and authenticate the user or to store any other relevant information.
 * @param {string} tokenSecret - The `tokenSecret` parameter is a string that represents the secret key
 * used to sign the token. This secret key should be kept secure and should not be shared with anyone.
 * It is used to verify the authenticity of the token when it is received by the server.
 * @param {string} [expiresIn=5m] - The `expiresIn` parameter is a string that specifies the expiration
 * time for the generated token. It can be in various formats such as seconds (e.g., '60'), minutes
 * (e.g., '5m'), hours (e.g., '2h'), days (e.g., '7
 * @returns a Promise that resolves to a string.
 */
export function generateToken(
  payload: string | object | Buffer,
  tokenSecret: string,
  expiresIn: string = '5m'
): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, tokenSecret, { expiresIn }, (error, token) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(token as string);
    });
  });
}

/**
 * The function `verifyToken` takes a token and a token secret, and returns a promise that resolves to
 * the decoded token payload or undefined if the token is invalid.
 * @param {string} token - The `token` parameter is a string that represents the JWT (JSON Web Token)
 * that needs to be verified. This token is typically generated by a server and sent to a client as a
 * means of authentication or authorization.
 * @param {string} tokenSecret - The `tokenSecret` parameter is a string that represents the secret key
 * used to sign and verify the token. It is a shared secret between the server generating the token and
 * the server verifying the token.
 * @returns a Promise that resolves to either a string, jwt.JwtPayload, or undefined.
 */
export function verifyToken(
  token: string,
  tokenSecret: string
): Promise<string | jwt.JwtPayload | undefined> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, tokenSecret, (error, decoded) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(decoded);
    });
  });
}
