import express from "express";

import mongoose from "mongoose";
import User from "../models/User.js";
import { generateToekn } from "../helper/generateToken.js";
import bcrypt from "bcryptjs";

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
router.post("/login", async (req, res, next) => {
	try {
		const { email, password } = req.body || {};

		// 1. Validate input
		if (!email?.trim() || !password?.trim()) {
			res.status(400);
			throw new Error("Email and password are required");
		}

		// 2. Find the user by email
		const user = await User.findOne({ email });

		// 3. If no user, or if password doesn't match, send a generic error
		// 'bcrypt.compare' securely compares the plain-text password with the hash
		if (!user || !(await bcrypt.compare(password, user.password))) {
			res.status(401); // Unauthorized
			throw new Error("Invalid email or password");
		}

		// 4. If credentials are correct, generate a token
		const token = generateToekn(user._id);

		// 5. Send the token and user data in the response
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
