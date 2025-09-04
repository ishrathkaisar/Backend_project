import express from "express";
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getTodos)
  .post(protect, createTodo);

router.route("/:id")
  .get(protect, getTodoById)
  .put(protect, updateTodo)
  .delete(protect, deleteTodo);

export default router;
