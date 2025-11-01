// Frontend: src/services/authService.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';

// POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashed });
    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (err) { next(err); }
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};
