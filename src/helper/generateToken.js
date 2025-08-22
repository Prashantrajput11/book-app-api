import jwt from "jsonwebtoken";
import "dotenv/config";
export const generateToekn = (userId) => {
	console.log("Secret used for signing:", process.env.JWT_SECRET);
	return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});
};
