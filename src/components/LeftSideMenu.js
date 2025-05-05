import React from "react";
import { NavLink } from "react-router-dom";
import { ReactComponent as DashboardIcon } from "../assets/svg/dashboard.svg";
import { ReactComponent as Notification } from "../assets/svg/notification.svg";
import { ReactComponent as Stockinhand } from "../assets/svg/stockinhand.svg";
import { ReactComponent as User } from "../assets/svg/user.svg";
import { ReactComponent as Log } from "../assets/svg/log.svg";
import { ReactComponent as List } from "../assets/svg/list.svg";

const LeftSideMenu = (props) => {
  const { isCollapsed } = props;
  const menu = [
    {
      section: "",
      links: [
        { path: "/dashboard", name: "Dashboard", icon: <DashboardIcon /> },
        { path: "/notification", name: "Notification", icon: <Notification /> },
      ],
    },
    {
      section: "Stock",
      links: [
        { path: "/cii-stock", name: "CII Stock", icon: <Stockinhand /> },
        { path: "/non-cii-stock", name: "Non-CII Stock", icon: <Stockinhand /> },
      ],
    },
    {
      section: "Management",
      links: [
        { path: "/company-management", name: "User Management", icon: <User /> },
        { path: "/log-management", name: "Log Management", icon: <Log /> },
        { path: "/list-management", name: "List Management", icon: <List /> },
      ],
    },
  ];

  return (
    <nav className="menu">
      {menu.map((section, index) => (
        <div key={index}>
          {section.section && <div className="section">{!isCollapsed && section.section}</div>}
          <ul>
            {section.links.map((link, linkIndex) => (
              <li key={linkIndex} className="menu-item">
                <div className="tooltip-container">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      isActive ? "active block" : "inactive block"
                    }
                  >
                    {link.icon}
                    {!isCollapsed && link.name}


                  </NavLink>
                  {isCollapsed && <span className="tooltip">{link.name}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default LeftSideMenu;