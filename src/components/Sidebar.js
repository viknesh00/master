import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LeftSideMenu from "./LeftSideMenu";
import { ReactComponent as LogoutIcon } from "../assets/svg/logout.svg";
import { logout } from "../services/ApiService";
import LogoutAlert from "../dialog/LogoutAlert";
const Sidebar = (props) => {
    const { handleToggleMenu, isCollapsed } = props;
    const navigate = useNavigate();
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <aside className={`h-screen flex flex-col transition-all duration-300 fixed top-0 left-0 ${isCollapsed ? "sidebar-minimize" : "sidebar-layout"
            }`}>
            <div className="sidebar-title">
                <img src="/assets/images/Logomark.png" alt="Logo" className="title-logo" />
                {!isCollapsed && <div className="title-heading">NATOASSET</div>}
            </div>
            {!isCollapsed ?
                <div className="close-btn" onClick={handleToggleMenu} >
                    <img src="/assets/svg/burger.svg" alt="Logo" />
                </div>
                :
                <div className="close-btn-minimize" onClick={handleToggleMenu} >
                    <img src="/assets/svg/burger.svg" alt="Logo" />
                </div>
            }

            <div className="sidebar-scrollable">
                <LeftSideMenu isCollapsed={isCollapsed} />
            </div>

            <div className="footer-section">
                <div className="menu">
                    <ul>
                        <li className="menu-item">
                            <div className="tooltip-container">
                                <NavLink
                                    to={"/logout"}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowLogoutAlert(true);
                                    }}
                                    className={({ isActive }) =>
                                        isActive ? "active block" : "inactive block"
                                    }
                                >
                                    <LogoutIcon />
                                    {!isCollapsed && "Logout"}
                                </NavLink>
                                {isCollapsed && <span className="tooltip">Logout</span>}
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="footer-nato">
                    {!isCollapsed ? (
                        <>
                            <span
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open("http://www.natobotics.com", "_blank");
                                }}
                            >
                                Powered by <span className="footer-companyname">NATOBOTICS</span>
                            </span>
                            <img src="/assets/images/natobotics-logo.png"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open("http://www.natobotics.com/contact-natobotics.html", "_blank");
                                }}
                                alt="Logo" className="title-logo" />
                        </>
                    ) : (
                        <img src="/assets/images/natobotics-logo.png"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open("http://www.natobotics.com/contact-natobotics.html", "_blank");
                            }}
                            alt="Logo" className="title-logo" />
                    )}
                </div>
            </div>
            <LogoutAlert
                open={showLogoutAlert}
                onClose={() => setShowLogoutAlert(false)}
                onConfirm={handleLogout}
            />
        </aside>
    );
};

export default Sidebar;