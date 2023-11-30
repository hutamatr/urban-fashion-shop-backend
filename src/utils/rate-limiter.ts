import { rateLimit } from 'express-rate-limit';

/* The code is creating a rate limiter middleware using the `express-rate-limit` package. The rate
limiter limits the number of requests that can be made from a single IP address within a specified
time window. */
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 20, // Limit each IP to 20 requests per `window` (here, per 5 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: (_req, res) => {
    const statusCode = 429;
    return res.status(statusCode).json({
      error: true,
      statusCode,
      message: ['Too many requests, try again later!'],
    });
  },
});

export default limiter;
