import express from "express";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", protect, createTodo);
router.get("/", protect, getTodos);
router.put("/:id", protect, updateTodo);
router.delete("/:id", protect, deleteTodo);

export default router;
