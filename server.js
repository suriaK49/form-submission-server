const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form.html"));
});

// Configure file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Receive form submission
app.post("/submit", upload.array("images"), (req, res) => {
  const { name, email, signature } = req.body;
  const imageFiles = req.files || [];

  const data = {
    name,
    email,
    images: imageFiles.map(file => file.filename),
    signatureDataUrl: signature,
    submittedAt: new Date().toISOString(),
  };

  // Save submission
  fs.appendFileSync("submissions.json", JSON.stringify(data) + "\n");

  console.log("Received submission:", data);
  res.json({ success: true, message: "Form received!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
