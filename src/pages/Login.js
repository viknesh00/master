import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../services/ApiService";
import { useUser } from "../UserContext.js";
import Resetpassword from "../ResetPassword.js";
import { cookieKeys,getCookie } from ".././services/Cookies";
import Ciistock from "./ciistock/Ciistock.js";

const Login = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
      const [open] = useState(props.value);
      const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();
    const { setName } = useUser();

    const handleLogin = (e) => {
        debugger
        e.preventDefault();
        let Data = {};
        Data = {
            ...Data,
            Email: username,
            Password: password,
        }
        if (username == "" || password == "") {
            alert("User Name and Password should not empty");
        }else{ 
        const url = `Login/Login`;
        postRequest(url, Data)
            .then((res) => {
                if (res.status === 200) {
                    if(res.data[0].userStatus == null){
                        setShowAlert(true);
                    }
                    else{
                        localStorage.setItem("isAuthenticated", "true"); // Set after successful login
                        localStorage.setItem("username", username); 
                        setName(username);
                        navigate("/dashboard");
                        //alert("Login Successfully");
                        const userData = {
                            userName: res.data[0].userName,
                            userCode: res.data[0].userCode,
                            email: res.data[0].email,
                            userType: res.data[0].userType,
                            isActive: res.data[0].isActive,
                            accessLevel: res.data[0].accessLevel
                        }
                        cookieKeys({ ...userData });
                    }

                }
                else {
                    alert("Login failed. Please check your credentials.");
                }
            })
            .catch((error) => {
                alert("Login failed. Please check your credentials.");
                console.error("API Error:", error);
            });
        }
        // if (username === "admin@natobotics.com" && password === "Welcome@Nat0b0tics") {
        //     localStorage.setItem("isAuthenticated", "true"); 
        //     navigate("/dashboard");
        // } else {
        //     alert("Invalid credentials");
        // }
    };

    const handleClose = () => {
        //props.handleOpenAddCompany();
        //console.log(formData)
        setShowAlert(prevState => !prevState);
      };
    
      const handleAlert = () => {   
        setShowAlert(prevState => !prevState);
    }

    return (
        <div
            className="flex justify-center items-center h-screen"
        >
            {showAlert && <Resetpassword value={showAlert} username={username} handleAlert={handleAlert} handleClose={handleClose} />}            <form
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
