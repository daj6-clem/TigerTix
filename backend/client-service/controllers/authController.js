// controllers/authController.js

import bcrypt  from "bcryptjs";
import jwt from "jsonwebtoken";
import {createUser, getUserByName} from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const JWT_EXPIRES_IN = 30 * 60 * 1000;

export const register = async(req, res) => {
    try {
        const {username, password} = req.body;

        const existing = await getUserByName(username);
        if (existing) return res.status(409).send("That user already exists.");

        const passHash = await bcrypt.hash(password, 10);

        const user = await createUser(username, passHash);

        res.status(201).json({message: "User registered", userID: user.id});
    } catch (err) {
        console.error("Register error:", err);

        res.status(500).json({message: "Registration failed"});
    }
};

export const login = async(req, res) => {
    try {
        const {username, password} = req.body;

        const user = await getUserByName(username);
        if (!user) return res.status(400).json({message: "Your username or password is incorrect."});

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(400).json({message: "Your username or password is incorrect."});

        const token = jwt.sign(
            {id: user.id, username: user.username},
            JWT_SECRET,
            {expiresIn: "30m"}
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: JWT_EXPIRES_IN,
        });

        res.json({message: "Logged in successfully."});
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({message: "Login failed"});
    }
};

export const logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.json({message: "Logged out."});
};

export const getCurrentUser = (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({message: "Not authenticated"});

        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({id: decoded.id, username: decoded.username});
    } catch(err) {
        console.error("Get current user error:", err);
        res.status(401).json({message: "Invalid or expired token"});
    }
};