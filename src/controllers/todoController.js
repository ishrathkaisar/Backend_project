import Todo from "../models/todoModel.js";

// @desc    Get all todos for logged-in user
// @route   GET /api/todos
// @access  Private
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id });
    res.json({ success: true, count: todos.length, data: todos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single todo by ID
// @route   GET /api/todos/:id
// @access  Private
export const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new todo
// @route   POST /api/todos
// @access  Private
export const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const todo = await Todo.create({
      title,
      description,
      status: "pending",
      user: req.user._id,
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.title = req.body.title || todo.title;
    todo.description = req.body.description || todo.description;
    todo.status = req.body.status || todo.status;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
