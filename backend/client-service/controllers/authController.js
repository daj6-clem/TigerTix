// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {createUser, getUserByName} = require("../models/User.js");

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
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAGE: JWT_EXPIRES_IN,
        });

        res.json({message: "Logged in successfully."});
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({message: "Login failed"});
    }
};

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.json({message: "Logged out."});
};