import rateLimit from 'express-rate-limit';

/**
 * Standard rate limiter for public auth routes (Login/Register)
 * 5 requests per 15 minutes
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: 'error',
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Standard rate limiter for daily actions (Check-in/Out)
 * 10 requests per 10 minutes
 */
export const attendanceRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  message: {
    status: 'error',
    code: 'TOO_MANY_REQUESTS',
    message: 'Action throttled. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
