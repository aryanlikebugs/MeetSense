import express from 'express';
import { getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Frontend: src/services/authService.js (for profile)
router.get('/:id', protect, getUser);
router.patch('/update', protect, upload.single('avatar'), updateUser);
router.delete('/delete', protect, deleteUser);

export default router;
