import { createContext, useState } from "react";
import { API_URL } from "./api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const register = async (username, password) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // <--- needed for cookies
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Registration failed");
        }

        const data = await res.json();
        setUser(data.user); // optional: automatically log in after registration
        return data;
    };

    const login = async (username, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // <--- MUST for cookies
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            throw new Error("Invalid credentials");
        }

        const data = await res.json();
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}
