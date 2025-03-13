const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5050;

// 📌 CORS 설정 (React와 연결)
app.use(cors());

// 📌 파일 저장 설정 (uploads 폴더에 저장)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 저장할 폴더 지정
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 원본 파일명 유지
  },
});

const upload = multer({ storage });

// 📌 파일 업로드 API
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("파일 업로드 실패!");
  }
  res.send(`파일이 성공적으로 저장되었습니다: ${req.file.path}`);
});

// 📌 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

