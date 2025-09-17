import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";

const router = express.Router();

router.post("/", protect, createTodo);
router.get("/", protect, getTodos);
router.get("/:id", protect, getTodoById);
router.put("/:id", protect, updateTodo);
router.delete("/:id", protect, deleteTodo);

export default router;
