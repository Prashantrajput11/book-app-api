import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true, minLength: 6 },
		profileImage: { type: String, default: "" },
	},
	{
		timestamps: true,
	}
);

// Hash the passowrd before saving use to database
userSchema.pre("save", async function (next) {
	// generate salt and hash the password
	if (this.isModified("password")) {
		//--> this is an important check to ensure that the password is only hashed when it is modified or created.
		const bcrypt = await import("bcryptjs");
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);

		next();
	}
});

const User = mongoose.model("User", userSchema);

export default User;
