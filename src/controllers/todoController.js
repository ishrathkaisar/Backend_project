import Todo from "../models/Todo.js";

// @desc    Create new todo
export const createTodo = async (req, res, next) => {
  try {
    const { title, description, dueDate } = req.body;

    const todo = await Todo.create({
      title,
      description,
      dueDate,
      user: req.user.id, // coming from auth middleware
    });

    res.status(201).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all todos for logged-in user
export const getTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({ user: req.user.id });
    res.status(200).json({ success: true, count: todos.length, data: todos });
  } catch (err) {
    next(err);
  }
};

// @desc    Update todo
export const updateTodo = async (req, res, next) => {
  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (todo.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete todo
export const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (todo.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await todo.deleteOne();

    res.status(200).json({ success: true, message: "Todo removed" });
  } catch (err) {
    next(err);
  }
};
