import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  

  return res.status(401).json({ message: "Not authorized, no token" });
};

export const createTodo = async (req, res) => {
  try {
    const todo = new Todo({
      ...req.body,
      userId: req.user._id,   // ✅ attach logged-in user
    });
    await todo.save();

    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ message: "Error creating todo", error: err.message });
  }
};
