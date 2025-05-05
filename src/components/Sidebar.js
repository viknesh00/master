import React from "react";
import { NavLink } from "react-router-dom";
import LeftSideMenu from "./LeftSideMenu";
import { ReactComponent as LogoutIcon } from "../assets/svg/logout.svg";
const Sidebar = (props) => {
    const { handleToggleMenu, isCollapsed } = props;

    return (
        <aside className={`h-screen flex-col transition-all duration-300 fixed top-0 left-0 overflow-y-auto ${isCollapsed ? "sidebar-minimize" : "sidebar-layout"
            }`}>
            <div className="sidebar-title">
                <img src="/assets/images/Logomark.png" alt="Logo" className="title-logo" />
                {!isCollapsed && <div className="title-heading">NATOASSET</div>}
            </div>
            {!isCollapsed ?
                <div className="close-btn" onClick={handleToggleMenu} >
                    <img src="/assets/svg/menu-close.svg" alt="Logo" />
                </div>
                :
                <div className="close-btn-minimize" onClick={handleToggleMenu} >
                    <img src="/assets/svg/menu-open.svg" alt="Logo" />
                </div>
            }
            <LeftSideMenu isCollapsed={isCollapsed} />

            <div className="footer-section">
                <div className="menu">
                    <ul>
                        <li className="menu-item">
                            <div className="tooltip-container">
                                <NavLink
                                    to={"/login"}
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
        </aside>
    );
};

export default Sidebar;