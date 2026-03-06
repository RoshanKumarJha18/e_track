const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Report = require('./models/Report');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

dotenv.config();

const app = express();

// ---------------- Cloudinary Config --------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------- Middleware ---------------------------
app.use(cors({
  origin: "*",
  methods: "GET,POST,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json({ limit: "10mb" }));

// ---------------- MongoDB Connection --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// ---------------- Default Route -------------------------
app.get("/", (req, res) => {
  res.send("E-Waste Tracking API is running ✔");
});

// ---------------- Create Report -------------------------
app.post('/api/reports', async (req, res) => {
  try {
    const { latitude, longitude, description, imageUrl, severity } = req.body;

    if (!latitude || !longitude || !description) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const newReport = new Report({
      latitude,
      longitude,
      description,
      imageUrl,
      severity,
    });

    await newReport.save();
    res.status(201).json({ message: 'Report created successfully!', report: newReport });

  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: 'Server error while creating report.' });
  }
});

// ---------------- Get All Reports -----------------------
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: 'Server error while fetching reports.' });
  }
});

// ---------------- Delete Report -------------------------
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    res.status(200).json({ message: 'Report deleted successfully.' });

  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: 'Server error while deleting report.' });
  }
});

// ---------------- Update Report Status ------------------
app.patch('/api/reports/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["new", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    res.status(200).json(updated);

  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: 'Server error while updating status.' });
  }
});

// ---------------- Upload Image via Cloudinary ------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image file provided." });

    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "ewaste-reports",
    });

    res.status(200).json({ imageUrl: result.secure_url });

  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: 'Server error while uploading image.' });
  }
});

// ---------------- Start Server --------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
