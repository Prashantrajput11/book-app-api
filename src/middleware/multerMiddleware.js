import multer from "multer";

// Configure multer to hold files in memory
const storage = multer.memoryStorage();

// You can also add file filters here for security
const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image")) {
		cb(null, true);
	} else {
		cb(new Error("Not an image! Please upload an image."), false);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		// Set the file size limit to 10 megabytes (written in bytes)
		fileSize: 10 * 1024 * 1024, // 10MB
	},
});

export default upload;
