import mongoose from "mongoose";
import express from "express";
import cloudinary from "../lib/cloudinary.js";

import Book from "../models/Book.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
	try {
		const { title, image, caption, rating } = req.body;

		if (!title || !caption || !image || !rating) {
			return res.status(400).json({ message: "All fields are required." });
		}

		// upload image to cloudinary
		const uploadRes = await cloudinary.uploader.upload(image);

		const imageUrl = uploadRes.secure_url;

		// Save to MongoDB
		const newBook = new Book({
			title,
			image: imageUrl,
			caption,
			rating,
			user: req.user._id,
		});
		await newBook.save();

		res.status(201).json(newBook);
	} catch (error) {
		console.log("error uploading image", error.message);
		// next();
	}
});

router.get("/", protect, async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 5;
		const skip = (page - 1) * limit;

		// Run both database queries in parallel for better performance
		const [totalBooks, books] = await Promise.all([
			Book.countDocuments(),
			Book.find({})
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate("user", "username profileImage"), // This populates the author's details
		]);

		res.status(200).json({
			books,
			currentPage: page,
			totalPages: Math.ceil(totalBooks / limit),
			totalBooks,
		});
	} catch (error) {
		// Pass any errors to the global error handler
		next(error);
	}
});

router.delete("/:id", protect, async (req, res) => {
	try {
		const book = await Book.findById(req.params.id);
		if (!book) return res.status(404).json({ message: "Book not found" });

		// check if user is the creator of the book
		if (book.user.toString() !== req.user._id.toString())
			return res.status(401).json({ message: "Unauthorized" });

		if (book.image && book.image.includes("cloudinary")) {
			try {
				const publicId = book.image.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy(publicId);
			} catch (deleteError) {
				console.log("Error deleting image from cloudinary", deleteError);
			}
		}

		await book.deleteOne();

		res.json({ message: "Book deleted successfully" });
	} catch (error) {
		console.log("Error deleting book", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

router.get("/user", protect, async (req, res) => {
	try {
		const books = await Book.find({ user: req.user._id }).sort({
			createdAt: -1,
		});
		res.json(books);
	} catch (error) {
		console.error("Get user books error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
