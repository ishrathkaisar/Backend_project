// userRoutes.js
import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUserAccount, uploadProfileImage } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/profile")
   .get(protect, getUserProfile)    
   .put(protect, updateUserProfile);

router.delete("/account", protect, deleteUserAccount);

router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Profile image upload route (ONLY ONCE)
router.post(
  "/:userId/upload-profile",
  protect,
  upload.single("profileImage"),
  uploadProfileImage
);

export default router;
