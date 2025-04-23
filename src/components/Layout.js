import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
    const [sidebarWidth, setSidebarWidth] = useState(260);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const isResizing = useRef(false);

    const MIN_WIDTH = 76;
    const MAX_WIDTH = 400;

    const handleToggleMenu = () => {
        const newCollapsed = !isCollapsed;
        setIsCollapsed(newCollapsed);
        setSidebarWidth(newCollapsed ? MIN_WIDTH : 260);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizing.current && !isPinned) {
                const newWidth = Math.max(MIN_WIDTH, Math.min(e.clientX, MAX_WIDTH));
                setSidebarWidth(newWidth);
                setIsCollapsed(newWidth <= MIN_WIDTH);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.classList.remove("no-select");
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isPinned]);

    const startResize = () => {
        if (!isPinned) {
            isResizing.current = true;
            document.body.classList.add("no-select");
        }
    };

    return (
        <div className="flex h-screen">
            <div
                className="relative transition-all duration-200 bg-white shadow"
                style={{ width: `${sidebarWidth}px` }}
            >
                <Sidebar
                    isCollapsed={isCollapsed}
                    handleToggleMenu={handleToggleMenu}
                    isPinned={isPinned}
                    setIsPinned={setIsPinned}
                />

                {!isPinned && (
                    <div
                        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10"
                        onMouseDown={startResize}
                    />
                )}
            </div>

            <div className="flex-1  transition-all duration-200">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
