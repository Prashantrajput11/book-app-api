import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary";
import { protect } from "../middleware/authMiddleware";
import Book from "../models/Book";

const router = express.Router();

// CREATE a new book
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
	} catch (error) {}
});

// READ all books | Paginated API
router.get("/", protect, async (req, res) => {
	try {
		const page = req.query.page || 1;
		const limit = req.query.page || 5;

		const skip = (page - 1) * limit;

		const books = await Book.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("user", "username profileImage");

		const totalBooks = books.countDocuments();
		res.send({
			books,
			currentPage: page,
			totalBooks,
			totalPages: Math.ceil(totalBooks / limit),
		});
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

// READ a single book by ID
router.get("/:id", (req, res) => {
	const book = books.find((b) => b.id === parseInt(req.params.id));
	if (!book) {
		return res.status(404).json({ message: "Book not found." });
	}
	res.json(book);
});

// UPDATE a book by ID
router.put("/:id", (req, res) => {
	const { title, author, publishedDate } = req.body;
	const book = books.find((b) => b.id === parseInt(req.params.id));
	if (!book) {
		return res.status(404).json({ message: "Book not found." });
	}
	if (title) book.title = title;
	if (author) book.author = author;
	if (publishedDate) book.publishedDate = publishedDate;
	res.json(book);
});

// DELETE a book by ID
router.delete("/:id", (req, res) => {
	const index = books.findIndex((b) => b.id === parseInt(req.params.id));
	if (index === -1) {
		return res.status(404).json({ message: "Book not found." });
	}
	books.splice(index, 1);
	res.status(204).send();
});

module.exports = router;
