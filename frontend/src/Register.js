import {useState} from "react";
import {API_URL} from './api';

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleRegister(e) {
        e.preventDefault();

        const res = await fetch("${API_URL}/api/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password}),
        });

        if (res.ok) {
            window.location.href = "/login";
        } else {
            const data = await res.json();
            setError(data.message);
        }
    }

    return (
        <form onSubmit={handleRegister}>
            <h2>Register</h2>
            {error && <p style={{color: "red"}}>{error}</p>}
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/>
            <button type="submit">Register</button>
        </form>
    );
}