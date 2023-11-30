import fs from 'fs';
import morgan from 'morgan';
import path from 'path';

/* The code `const accessLogStream = fs.createWriteStream(path.join(__dirname, '..', '..', 'logs',
'access.log'), { flags: 'a' });` is creating a write stream to a log file named "access.log". */
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '..', '..', 'logs', 'access.log'),
  { flags: 'a' }
);

/**
 * The logger function returns a middleware function that logs HTTP requests.
 * @returns The function `logger` is returning the result of calling `morgan` with the arguments
 * `'combined'` and `{ stream: accessLogStream }`.
 */
export default function logger() {
  return morgan('combined', { stream: accessLogStream });
}
