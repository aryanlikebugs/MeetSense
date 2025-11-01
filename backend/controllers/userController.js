// Frontend: src/services/authService.js for profile
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// GET /api/users/:id
export const getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  res.json(user);
};

// PATCH /api/users/update
export const updateUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.name = name || user.name;
  user.email = email || user.email;
  if (password) user.password = await bcrypt.hash(password, 10);
  if (req.file) user.avatar = req.file.path;
  await user.save();
  res.json(user);
};

// DELETE /api/users/delete
export const deleteUser = async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ message: 'User deleted' });
};
