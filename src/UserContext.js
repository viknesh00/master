import { createContext, useContext, useState, useEffect } from "react";

// Create User Context
const UserContext = createContext();

// Provider Component
export const UserProvider = ({ children }) => {
    const [name, setName] = useState(localStorage.getItem("username") || "");

    useEffect(() => {
        if (name) {
            localStorage.setItem("username", name); // Store username in localStorage
        }
    }, [name]);

    return (
        <UserContext.Provider value={{ name, setName }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom Hook to use Context easily
export const useUser = () => useContext(UserContext);
