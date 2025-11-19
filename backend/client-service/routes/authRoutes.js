// routes/authRoutes.js

import express from "express";
import {register, login, logout, getCurrentUser} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyToken, getCurrentUser);

export default router;