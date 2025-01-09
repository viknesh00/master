import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === "admin@natobotics.com" && password === "Welcome@Nat0b0tics") {
            localStorage.setItem("isAuthenticated", "true"); 
            navigate("/dashboard");
        } else {
            alert("Invalid credentials");
        }
    };

    return (
        <div
            className="flex justify-center items-center h-screen"
        >
            <form
                onSubmit={handleLogin}
                className="p-6 rounded-lg shadow-lg"
                style={{
                    background: "linear-gradient(90deg, #1e3c72, #2a5298)",
                    backdropFilter: "blur(10px)",
                    width: "400px",
                    textAlign: "center",
                    color: "white",
                }}
            >
                <h2 className="text-2xl font-semibold mb-6"> Welcome to NATOASSET</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        value={username}
                        placeholder="User Name"
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 rounded border-none outline-none"
                        style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                        }}
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 rounded border-none outline-none"
                        style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                        }}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 mt-4 rounded"
                    style={{
                        background: "rgba(255, 255, 255, 0.3)",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
