require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const photosRouter = require("./uploads");

const app = express();

// Enable CORS for Next.js frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// serve uploaded files under /uploads/...
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// fake auth stub (replace later)
app.use((req, _res, next) => { req.user = { id: "00000000-0000-0000-0000-000000000001" }; next(); });

app.use("/api/photos", photosRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
