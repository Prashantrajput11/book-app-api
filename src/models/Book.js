import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},

		caption: {
			type: String,
			trim: true,
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		image: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
