import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; 
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleTodo,
  bulkTodos,
  getTodosStats,
  uploadTodoImage,
  deleteTodoImage
} from "../controllers/todoController.js";

const router = express.Router();

// ✅ Image routes
router.post("/:id/image", protect, upload.single("image"), uploadTodoImage);
router.delete("/:id/image", protect, deleteTodoImage);

// ✅ Other routes
router.get("/stats", protect, getTodosStats);
router.post("/bulk", protect, bulkTodos);
router.patch("/:id/toggle", protect, toggleTodo);

// ✅ CRUD
router.post("/", protect, createTodo);
router.get("/", protect, getTodos);
router.get("/:id", protect, getTodoById);
router.put("/:id", protect, updateTodo);
router.delete("/:id", protect, deleteTodo);

export default router;
