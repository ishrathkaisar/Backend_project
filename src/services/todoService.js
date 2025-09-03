import { Todo } from '../models/Todo.js';

export async function createTodo(userId, payload) {
  return await Todo.create({ ...payload, userId });
}

export async function listTodos(userId, { page = 1, limit = 10, search = '', status }) {
  const q = { userId };
  if (search) q.title = { $regex: search, $options: 'i' };
  if (status === 'completed') q.completed = true;
  if (status === 'pending') q.completed = false;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Todo.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Todo.countDocuments(q),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
}

export async function getTodo(userId, id) {
  const todo = await Todo.findOne({ _id: id, userId });
  if (!todo) { const e = new Error('Todo not found'); e.status = 404; throw e; }
  return todo;
}

export async function updateTodo(userId, id, payload) {
  const todo = await Todo.findOneAndUpdate({ _id: id, userId }, payload, { new: true });
  if (!todo) { const e = new Error('Todo not found'); e.status = 404; throw e; }
  return todo;
}

export async function deleteTodo(userId, id) {
  const todo = await Todo.findOneAndDelete({ _id: id, userId });
  if (!todo) { const e = new Error('Todo not found'); e.status = 404; throw e; }
  return { deleted: true };
}

export async function toggleTodo(userId, id) {
  const todo = await Todo.findOne({ _id: id, userId });
  if (!todo) { const e = new Error('Todo not found'); e.status = 404; throw e; }
  todo.completed = !todo.completed;
  todo.completedAt = todo.completed ? new Date() : null;
  await todo.save();
  return todo;
}
