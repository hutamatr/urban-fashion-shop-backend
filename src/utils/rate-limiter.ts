import { rateLimit } from 'express-rate-limit';

/** The code is creating a rate limiter middleware using the `express-rate-limit` package. The rate
 * limiter limits the number of requests that can be made from a single IP address
 * within a specified time window.
 **/
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 500, // Limit each IP to 50 requests per `window` (here, per 10 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  handler: (_req, res) => {
    const statusCode = 429;
    return res.status(statusCode).json({
      status: 'error',
      statusCode,
      message: ['Too many requests, try again later!'],
    });
  },
});

export default limiter;
