import Todo from "../models/todoModel.js";

// Create todo
export const createTodo = async (req, res) => {
  try {
    const todo = await Todo.create({
      title: req.body.title,
      description: req.body.description,
      user: req.user.id, // from protect middleware
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 // GET TODOS with pagination + filtering + search
 export const getTodos = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = { user: req.user._id };

    // filter by status if provided (pending/completed)
    if (status) {
      query.status = status;
    }

    // search in title/description if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i "} },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // count total docs for pagination info
    const total = await Todo.countDocuments(query);

    // fetch with skip + limit
    const todos = await Todo.find(query)
     .sort({ createdAt: -1 })
     .skip((page -1) * limit)
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
