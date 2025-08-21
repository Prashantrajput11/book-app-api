import jwt from "jsonwebtoken";
import "dotenv/config";
export const generateToekn = (userId) => {
	return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});
};
