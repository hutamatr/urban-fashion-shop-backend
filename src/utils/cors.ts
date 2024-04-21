import cors from 'cors';

import { adminBaseURL, feBaseURL, host } from './constants';

const whitelist = [
  `${host}:5173`,
  `${host}:3000`,
  'http://127.0.0.1:5173',
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
