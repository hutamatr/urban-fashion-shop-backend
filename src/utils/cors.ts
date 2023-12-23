import cors from 'cors';

export const port = process.env.PORT;
export const host = process.env.HOST;

const whitelist = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
/**
 * The `corsMiddleware` function returns a middleware function that handles Cross-Origin Resource
 * Sharing (CORS) for HTTP requests.
 * @returns The corsMiddleware function is returning a cors middleware function.
 */
export default function corsMiddleware() {
  return cors({
    origin: whitelist,
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    allowedHeaders: [
      'Access-Control-Allow-Headers',
      'Content-Type',
      'Authorization',
    ],
    credentials: true,
  });
}
