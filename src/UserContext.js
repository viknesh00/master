import { createContext, useContext, useState, useEffect } from "react";

// Create User Context
const UserContext = createContext();

// Provider Component
export const UserProvider = ({ children }) => {
    const [name, setName] = useState(localStorage.getItem("username") || "");
    const [fullName, setFullName] = useState(localStorage.getItem("userName") || "");

    useEffect(() => {
        if (name) {
            localStorage.setItem("username", name); // Store username in localStorage
        };
        if (fullName) {
            localStorage.setItem("userName", fullName);
        }
    }, [name, fullName]);

    return (
        <UserContext.Provider value={{ name, setName, fullName, setFullName }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom Hook to use Context easily
export const useUser = () => useContext(UserContext);
