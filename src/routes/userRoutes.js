import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/profile")
   .get(protect, getUserProfile)    // GET user profile
   .put(protect, updateUserProfile);// UPDATE profile

router.delete("/account", protect, deleteUserAccount); // DELETE account   

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

export default router;
