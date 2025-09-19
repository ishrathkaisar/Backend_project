import mongoose from "mongoose";
import Todo from "../models/todoModel.js";
import fs from "fs";
import path from "path";


// Create todo
export const createTodo = async (req, res) => {
  try {
    const todo = await Todo.create({
      title: req.body.title,
      description: req.body.description,
      user: req.user.id,
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get todos (with pagination, search, filter)
export const getTodos = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = { user: req.user._id };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Todo.countDocuments(query);
    const todos = await Todo.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      todos,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single todo
export const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update todo
export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.title = req.body.title || todo.title;
    todo.description = req.body.description || todo.description;
    todo.status = req.body.status || todo.status;
    await todo.save();

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete todo
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    await todo.deleteOne();
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle todo
export const toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.status = todo.status === "completed" ? "pending" : "completed";
    await todo.save();

    res.json({ message: "Todo toggled", todo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk operations
export const bulkTodos = async (req, res) => {
  try {
    const { action, ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids array is required" });
    }

    const filter = { _id: { $in: ids }, user: req.user._id };

    if (action === "delete") {
      const result = await Todo.deleteMany(filter);
      return res.json({ message: "Todos deleted", deletedCount: result.deletedCount });
    }

    if (["complete", "pending"].includes(action)) {
      const status = action === "complete" ? "completed" : "pending";
      const result = await Todo.updateMany(filter, { $set: { status } });
      return res.json({ message: `Todos updated to ${status}`, modifiedCount: result.modifiedCount });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stats
export const getTodosStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Todo.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result = { total: 0, completed: 0, pending: 0 };
    result.total = await Todo.countDocuments({ user: userId });

    stats.forEach(s => {
      if (s._id === "completed") result.completed = s.count;
      if (s._id === "pending") result.pending = s.count;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload or update image for a todo
export const uploadTodoImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    // ✅ Generate full URL
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Save image path to todo
    todo.image = imageUrl;
    await todo.save();

    res.json({
      message: "Image uploaded successfully",
      todo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete image from a todo
export const deleteTodoImage = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (!todo.image) {
      return res.status(400).json({ message: "No image to delete" });
    }

    // Get file path from stored image URL
    const filePath = path.join(process.cwd(), "src", todo.image);

    // Delete file from filesystem (optional)
    fs.unlink(filePath, (err) => {
      if (err) {
        console.warn("⚠️ Could not delete image file:", err.message);
      }
    });

    // Remove image from todo document
    todo.image = undefined;
    await todo.save();

    res.json({ message: "Image deleted successfully", todo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
