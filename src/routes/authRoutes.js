import express from "express";
import User from "../models/User.js";
import { generateToekn } from "../helper/generateToken.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// @route       POST/api/auth/register
// @description  Register new user
// @access       Private
// Handle user registration.
router.post("/register", async (req, res, next) => {
	try {
		const { username, email, password } = req.body || {};

		if (!username?.trim() || !email?.trim() || !password?.trim()) {
			res.status(400);
			throw new Error("Username, email and password are required");
		}
		if (password?.length < 6) {
			res.status(400);
			throw new Error("Password must be at least 6 characters long");
		}

		const userWithEmailExists = await User.findOne({ email });
		const userWithUserNameExists = await User.findOne({ username });

		if (userWithEmailExists) {
			res.status(409); // 409 Conflict
			throw new Error("A user with this email already exists");
		}
		if (userWithUserNameExists) {
			res.status(409); // 409 Conflict
			throw new Error("A user with this username already exists");
		}

		const profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${username}`;
		const user = await User.create({
			username,
			email,
			password,
			profileImage: profileImage || "",
		});

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

// @route       POST /api/auth/login
// @description Authenticate user & get token
// @access      Public
router.post("/login", async (req, res, next) => {
	try {
		const { email, password } = req.body || {};

		if (!email?.trim() || !password?.trim()) {
			res.status(400);
			throw new Error("Email and password are required");
		}

		const user = await User.findOne({ email });

		if (!user || !(await bcrypt.compare(password, user.password))) {
			res.status(401); // Unauthorized
			throw new Error("Invalid email or password");
		}

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

export default router;
