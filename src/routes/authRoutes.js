import express from "express";

import mongoose from "mongoose";
import User from "../models/User.js";
import { generateToekn } from "../helper/generateToken.js";

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
		const userWithEmailExists = await User.findOne({ email });
		const userWithUserNameExists = await User.findOne({ username });

		// If the user already exists, throw an error.
		if (userWithEmailExists) {
			res.status(409); // 409 Conflict
			throw new Error("A user with this email already exists");
		}
		if (userWithUserNameExists) {
			res.status(409); // 409 Conflict
			throw new Error("A user with this username already exists");
		}

		// Get random avatar
		const profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${username}`;
		const user = await User.create({
			username,
			email,
			password,
			profileImage: profileImage || "",
		});
		// await user.save();

		// generate token

		const token = generateToekn(user._id);

		res.status(200).json({
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				profileImage: user.profileImage,
			},
		});
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
// router.post("/login", async (req, res, next) => {
// 	try {
// 		const { email, password } = req.body || {};

// 		// Validate input
// 		if (!email || !password) {
// 			res.status(400);
// 			throw new Error("Email and password are required");
// 		}

// 		// Check if user exists
// 		const user = await User.findOne({ email });

// 		// Important: Use a generic error message to prevent userusername enumeration attacks
// 		if (!user) {
// 			res.status(401); // Unauthorized
// 			throw new Error("Invalid credentials");
// 		}

// 		// Check if password matches (assuming your User model has a matchPassword method)
// 		const isMatch = await user.matchPassword(password);

// 		if (!isMatch) {
// 			res.status(401); // Unauthorized
// 			throw new Error("Invalid credentials");
// 		}

// 		// If credentials are correct, create tokens
// 		const payload = { userId: user._id.toString() };
// 		const accessToken = await generateToken(payload, "1m");
// 		const refreshToken = await generateToken(payload, "30d");

// 		// Set the refresh token in the secure cookie
// 		res.cookie("refreshToken", refreshToken, {
// 			httpOnly: true,
// 			secure: process.env.NODE_ENV === "production",
// 			sameSite: "strict",
// 			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
// 		});

// 		// Send the access token and user info back to the client
// 		res.status(200).json({
// 			message: "Login successful",
// 			accessToken,
// 			user: {
// 				_id: user._id,
// 				username: user.username,
// 				email: user.email,
// 			},
// 		});
// 	} catch (error) {
// 		next(error);
// 	}
// });

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
