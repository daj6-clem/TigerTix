// controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {createUser, getUserByName} = require("../models/User.js");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

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
            {expiresIn: "1h"}
        );

        res.json({token});
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({message: "Login failed"});
    }
};

export const logout = async (req, res) => {
    res.json({message: "Logged out."});
};