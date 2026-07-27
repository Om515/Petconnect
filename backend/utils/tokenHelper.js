import jwt from "jsonwebtoken";

/**
 * Creates and sets a JWT token in an HTTP-only cookie.
 * @param {Object} user - User object containing _id and email
 * @param {string} cookieName - Name of the cookie (e.g., 'user_token', 'caretaker_token', 'admin_token')
 * @param {Object} res - Express response object
 * @param {string} expiresIn - Expiration time string (e.g., '1d', '1h')
 * @param {number} maxAge - Cookie maxAge in milliseconds
 */
export const createWebToken = (user, cookieName, res, expiresIn = "1d", maxAge = 24 * 60 * 60 * 1000) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  res.cookie(cookieName, token, {
    maxAge,
    httpOnly: true,
    sameSite: "strict",
  });

  return token;
};
