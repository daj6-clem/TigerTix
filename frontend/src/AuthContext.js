import {createContext, useState, useEffect} from "react";
import axios from "axios";

export const AuthContext = createContext();

const API = "http://localhost:6001/api/auth"

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await axios.get(`${API}/me`, {withCredentials: true});
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        await axios.post(`${API}/login`, {username, password}, {withCredentials: true});
        await fetchUser();
    };

    const register = async (username, password) => {
        await axios.post(`${API}/register`, {username, password}, {withCredentials: true});
        await fetchUser();
    };

    const logout = async () => {
        await axios.post(`${API}/logout`, {}, {withCredentials: true});
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, loading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );


}