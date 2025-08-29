import express from "express";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";
import cors from "cors"; // 1. Import cors

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors()); // This allows requests from any origin
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectDB();
});
// ZZVhOY5475QqnBBD;
