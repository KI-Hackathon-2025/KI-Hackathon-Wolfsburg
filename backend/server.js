const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5050;

// 📌 CORS setup (connect with React)
app.use(cors());

// 📌 File storage setup (store in the 'uploads' folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the folder to store files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original file name
  },
});

const upload = multer({ storage });

// 📌 File upload API
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("File upload failed!");
  }
  res.send(`File has been successfully saved: ${req.file.path}`);
});

// 📌 Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
