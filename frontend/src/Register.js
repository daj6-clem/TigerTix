import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Register() {
    const { register } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();
        setError(""); // clear previous errors

        try {
            await register(username, password); // call context function
            navigate("/"); // redirect to home after successful registration
        } catch (err) {
            setError(err.message || "Registration failed."); // show backend error
        }
    }

    return (
        <form onSubmit={handleRegister}>
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Register</button>

            <button
                type="button"
                onClick={() => navigate("/login")}
                style={{ marginTop: "1rem" }}
            >
                Go to Login
            </button>
        </form>
    );
}
