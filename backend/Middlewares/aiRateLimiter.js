import rateLimit from "express-rate-limit";

// Limiter for guest/anonymous users
export const aiGuestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // Limit each IP to 2 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: "Daily limit reached.",
    message: "You have used your 2 free AI scans for today! Please log in or create an account for unlimited access."
  },
});
