import cors from 'cors';

import { adminBaseURL, feBaseURL, host } from './constants';

export const allowedOrigins = [
  `${host}:5173`,
  `${host}:4173`,
  `${host}:3000`,
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:3000',
  feBaseURL as string,
  adminBaseURL as string,
];
/**
 * The `corsMiddleware` function returns a middleware function that handles Cross-Origin Resource
 * Sharing (CORS) for HTTP requests.
 * @returns The corsMiddleware function is returning a cors middleware function.
 */
export default function corsMiddleware() {
  return cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Methods',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  });
}
