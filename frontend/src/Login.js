import {useState, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "./AuthContext";

export default function Login() {
    const {login} = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

       try {
        await login(username, password);
        navigate("/");
       } catch (err) {
        setError("Invalid username or password.");
       }
    }

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            {error && <p style={{color:"red"}}>{error}</p>}
            <input 
                value={username} 
                onChange={e=>setUsername(e.target.value)} 
                placeholder="Username" 
            />
            <input 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="Password" 
            />
            <button type="submit">Login</button>
            
            <button 
                type="button"
                onClick={() => navigate("/register")}
                style={{marginTop: "1rem"}}
            >
                Go to Register
            </button>
        </form>
    );
}