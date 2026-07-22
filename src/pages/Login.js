import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postRequest, getApiErrorMessage } from "../services/ApiService";
import { hasSession, storeSession } from "../services/TokenStorage";
import { useUser } from "../UserContext.js";
import Resetpassword from "../ResetPassword.js";
import { cookieKeys,getCookie } from ".././services/Cookies";
import Ciistock from "./ciistock/Ciistock.js";
import { toast } from "react-toastify";
import { ToastError, ToastSuccess } from "../services/ToastMsg.js";
import {CircularProgress,} from "@mui/material";

const Login = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
      const [open] = useState(props.value);
      const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { setName, setFullName  } = useUser();
    const [loading, setLoading] = useState(false);

    // Where ProtectedRoute bounced the user from, so sign-in can put them back.
    // Guarded against a value that would bounce straight back here.
    const requestedPath = location.state?.from;
    const returnTo =
        requestedPath && requestedPath !== "/" && !requestedPath.startsWith("/login")
            ? requestedPath
            : "/dashboard";

    // Someone with a live session has no business on the login screen - send
    // them straight through instead of asking them to sign in again.
    useEffect(() => {
        if (hasSession()) {
            navigate(returnTo, { replace: true });
        }
    }, [navigate, returnTo]);

   const handleLogin = (e) => {
    e.preventDefault();

    if (loading) return; // 🔒 Prevent multiple clicks

    if (username === "" || password === "") {
        ToastError("User Name and Password should not empty");
        return;
    }

    setLoading(true); // 🔒 Lock button

    const Data = {
        Email: username,
        Password: password,
    };

    postRequest("Login/Login", Data)
        .then((res) => {
            if (res.status === 200) {
                // The API now answers with a token pair alongside the user:
                // { accessToken, refreshToken, expiresIn, expiresAtUtc, user }
                const auth = res.data;
                const user = auth?.user;

                if (!user) {
                    ToastError("Login failed. Please check your credentials.");
                    return;
                }

                if (user.userStatus == null) {
                    // First sign-in: the password must be changed before a
                    // session is established, so no tokens are stored yet.
                    setShowAlert(true);
                } else {
                    storeSession(auth, username);

                    setName(username);
                    setFullName(user.userName);

                    const userData = {
                        userName: user.userName,
                        userCode: user.userCode,
                        email: user.email,
                        userType: user.userType,
                        isActive: user.isActive,
                        accessLevel: user.accessLevel
                    };

                    cookieKeys({ ...userData });

                    ToastSuccess("Login Successfully"); // ✅ only once
                    navigate(returnTo, { replace: true });
                }
            } else {
                ToastError("Login failed. Please check your credentials.");
            }
        })
        .catch((error) => {
            // The API distinguishes bad credentials (401) from a disabled
            // account (403); show whichever message it sent.
            ToastError(getApiErrorMessage(error, "Login failed. Please check your credentials."));
            console.error("API Error:", error);
        })
        .finally(() => {
            setLoading(false); // 🔓 Unlock button
        });
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
        className="flex justify-center items-center h-screen bg-cover bg-center" 
        style={{ backgroundImage: "url('/assets/images/Login.png')" }}
    >
        {showAlert && <Resetpassword value={showAlert} username={username} handleAlert={handleAlert} handleClose={handleClose} />}
            <div className="absolute top-0 left-0 w-full h-[120px] bg-black flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-semibold">
                    <span className="text-red-500">C</span>
                    <span className="text-green-500">o</span>
                    <span className="text-blue-500">n</span>
                    <span className="text-purple-500">n</span>
                    <span className="text-yellow-500">e</span>
                    <span className="text-pink-500">c</span>
                    <span className="text-indigo-500">t</span>
                    <span className="inline-flex items-center text-white">
        ing to <img src="/assets/images/Logomark.png" alt="Logo" width={15} height={15} className="ml-1" /> NATOASSET
    </span> 
                </h2>
                <p className="text-sm">Sign in with your account</p>
            </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <p className="text-lg text-center">Sign In</p>
            <form onSubmit={handleLogin} className="mt-6">
                <div className="mb-4">
                    <label className="block text-black">Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="w-full p-2 rounded border bg-white bg-opacity-20" 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-black">Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full p-2 rounded border bg-white bg-opacity-20" 
                    />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <div>
                        <input type="checkbox" id="remember" />
                        <label htmlFor="remember" className="ml-1">Keep me signed in</label>
                    </div>
                    <a href="#" className="text-blue-600">Forgot Password?</a>
                </div>
                <button 
                    type="submit" 
                    className="w-full mt-4 bg-black text-white py-2 rounded shadow hover:bg-gray-800"
                >
                     {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
                </button>
            </form>
            <p className="text-center mt-4 text-gray-700 text-sm">
                <span className="text-red-500">Powered by</span> <span className="text-purple-500">Natobotics</span>
            </p>
        </div>
    </div>  
    
    );
};

export default Login;
