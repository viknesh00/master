import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {

    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleToggleMenu = () => {
        setIsCollapsed((prevState) => !prevState);
    };

    return (
        <div className="flex h-screen">
            <Sidebar isCollapsed={isCollapsed} handleToggleMenu={handleToggleMenu} />
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-[76px]" : "ml-[260px]"}`}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
