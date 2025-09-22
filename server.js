import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/database.js";
import authRoutes from "./src/routes/auth.js";
import todoRoutes from "./src/routes/todoRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import morgan from "morgan";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Connect DB
connectDB();

// ✅ Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/users", userRoutes);
app.use(notFound);
app.use(errorHandler);

// ✅ Serve uploads as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
