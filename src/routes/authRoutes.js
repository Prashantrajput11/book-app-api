import express from "express";

import { generateToken } from "../utils/generateToken.js";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();
// Routes

// @route       POST/api/auth/register
// @description  Register new user
// @access       Private
// Handle user registration.
router.post("/register", async (req, res, next) => {
	try {
		// Get user details from the request body.
		const { username, email, password } = req.body || {};

		// Validate that all required fields are present.
		if (!username?.trim() || !email?.trim() || !password?.trim()) {
			res.status(400);
			throw new Error("Username, email and password are required");
		}
		if (password?.length < 6) {
			res.status(400);
			throw new Error("Password must be at least 6 characters long");
		}

		// Check if a user with this email already exists in the database.
		const userExists = await User.findOne({ email });

		// If the user already exists, throw an error.
		if (userExists) {
			res.status(409); // 409 Conflict
			throw new Error("A user with this email already exists");
		}

		const user = await User.create({
			username,
			email,
			password,
		});

		if (user) {
			// Create payloads for the tokens
			const payload = { userId: user._id.toString() };

			// Generate a short-lived access token and a long-lived refresh token
			const accessToken = await generateToken(payload, "1m"); // e.g., 15 minutes
			const refreshToken = await generateToken(payload, "30d"); // e.g., 30 days

			// Set the refresh token in a secure, HttpOnly cookie
			res.cookie("refreshToken", refreshToken, {
				httpOnly: true, // Prevents client-side JS from accessing the cookie
				secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
				sameSite: "strict", // Helps prevent CSRF attacks
				maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matching the token's expiration
			});

			// Send the access token and user data in the JSON response
			res.status(201).json({
				accessToken,
				user: {
					_id: user._id,
					username: user.username,
					email: user.email,
				},
			});
		} else {
			res.status(400);
			throw new Error("Invalid user data");
		}
	} catch (error) {
		next(error);
	}
});

// @route       POST/api/auth/logout
// @description  Logout new user
// @access       Private

// router.post("/logout", (req, res) => {
// 	res.clearCookie("refreshToken", {
// 		httpOnly: true,
// 		secure: process.env.NODE_ENV === "production",
// 		sameSite: "none",
// 	});

// 	res.status(200).json({ message: "logged out succesfully" });
// });

// @route       POST /api/auth/login
// @description Authenticate user & get token
// @access      Public
router.post("/login", async (req, res, next) => {
	try {
		const { email, password } = req.body || {};

		// Validate input
		if (!email || !password) {
			res.status(400);
			throw new Error("Email and password are required");
		}

		// Check if user exists
		const user = await User.findOne({ email });

		// Important: Use a generic error message to prevent userusername enumeration attacks
		if (!user) {
			res.status(401); // Unauthorized
			throw new Error("Invalid credentials");
		}

		// Check if password matches (assuming your User model has a matchPassword method)
		const isMatch = await user.matchPassword(password);

		if (!isMatch) {
			res.status(401); // Unauthorized
			throw new Error("Invalid credentials");
		}

		// If credentials are correct, create tokens
		const payload = { userId: user._id.toString() };
		const accessToken = await generateToken(payload, "1m");
		const refreshToken = await generateToken(payload, "30d");

		// Set the refresh token in the secure cookie
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		// Send the access token and user info back to the client
		res.status(200).json({
			message: "Login successful",
			accessToken,
			user: {
				_id: user._id,
				username: user.username,
				email: user.email,
			},
		});
	} catch (error) {
		next(error);
	}
});

// @route         POST api/auth/refresh
// @description   Generate new access token from refresh token
// @access        Public (Needs valid refresh token in cookie)
// router.post("/refresh", async (req, res, next) => {
// 	try {
// 		const token = req.cookies?.refreshToken;
// 		console.log("Refreshing token...");

// 		if (!token) {
// 			res.status(401);
// 			throw new Error("No refresh token");
// 		}

// 		const { payload } = await jwtVerify(token, JWT_SECRET);

// 		const user = await User.findById(payload.userId);

// 		if (!user) {
// 			res.status(401);
// 			throw new Error("No user");
// 		}

// 		const newAccessToken = await generateToken(
// 			{ userId: user._id.toString() },
// 			"1m"
// 		);

// 		res.json({
// 			accessToken: newAccessToken,
// 			user: {
// 				id: user._id,
// 				username: user.username,
// 				email: user.email,
// 			},
// 		});
// 	} catch (err) {
// 		res.status(401);
// 		next(err);
// 	}
// });
export default router;
