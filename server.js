import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import authRoutes from "./src/routes/auth.js";
import todoRoutes from "./src/routes/todoRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/users", userRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
