import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Adjust the path to your User model

/**
 * Middleware to protect routes by verifying a JWT.
 */
export const protect = async (req, res, next) => {
	let token;

	// Check if the Authorization header exists and starts with "Bearer"
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			// 1. Extract the token from the header (e.g., "Bearer <token>")
			token = req.headers.authorization.split(" ")[1];

			// 2. Verify the token using the secret key
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// 3. Find the user in the database using the ID from the token's payload
			// We attach the user to the request object, excluding the password
			req.user = await User.findById(decoded.id).select("-password");

			// 4. If user is found, proceed to the next middleware or route handler
			if (req.user) {
				return next();
			} else {
				res.status(401);
				throw new Error("Not authorized, user not found");
			}
		} catch (error) {
			// This will catch errors from jwt.verify (e.g., expired token)
			res.status(401);
			return next(new Error("Not authorized, token failed"));
		}
	}

	// If no token is found in the header at all
	if (!token) {
		res.status(401);
		return next(new Error("Not authorized, no token"));
	}
};
