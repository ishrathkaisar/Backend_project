import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import authRoutes from "./src/routes/auth.js";
import todoRoutes from "./src/routes/todoRoutes.js"; 

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
