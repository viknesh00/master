import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Package,
  Boxes,
  Layers,
  Truck,
  ClipboardCheck,
  TrendingUp,
  Settings,
  Users,
  History,
  ListTodo,
  ChevronDown
} from "lucide-react";
import { getRequest } from "../services/ApiService";

const LeftSideMenu = (props) => {
  const { isCollapsed } = props;
  const location = useLocation();

  // State to track which parent sections are open in the sidebar
  const [openSections, setOpenSections] = useState({});

  // Unread badge on the Notification item.
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = () => {
      getRequest("Notifications/unread-count")
        .then((res) => {
          if (!cancelled && res.status === 200) {
            setUnreadCount(res.data?.unreadCount || 0);
          }
        })
        .catch(() => {
          // A failing badge must never disrupt navigation; leave the last value.
        });
    };

    loadUnreadCount();

    // Refresh on navigation (covers "user just read them all") and on a slow
    // poll so events raised by colleagues show up without a reload.
    const timer = setInterval(loadUnreadCount, 60000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [location.pathname]);

  const menu = [
    {
      section: "",
      links: [
        { path: "/dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { path: "/notifications", name: "Notification", icon: <Bell size={20} /> },
      ],
    },
    {
      section: "Stock",
      links: [
        {
          name: "CII Stock",
          icon: <Package size={20} />,
          isParent: true,
          children: [
            { path: "/cii-stock", name: "CII Stock List", icon: <Layers size={16} /> },
            { path: "/cii-bulk-outward", name: "Bulk Outward", icon: <Truck size={16} /> },
          ],
        },
        {
          name: "Non-CII Stock",
          icon: <Boxes size={20} />,
          isParent: true,
          children: [
            { path: "/non-cii-stock", name: "Non-CII Stock List", icon: <Layers size={16} /> },
            { path: "/non-cii-bulk-outward", name: "Bulk Outward", icon: <Truck size={16} /> },
          ],
        },
        { path: "/poolstockcheck", name: "Pools Stock Check", icon: <ClipboardCheck size={20} /> },
        { path: "/reports", name: "Reports", icon: <TrendingUp size={20} /> },
      ],
    },
    {
      section: "Management",
      links: [
        {
          name: "Management",
          icon: <Settings size={20} />,
          isParent: true,
          children: [
            { path: "/company-management", name: "User Management", icon: <Users size={16} /> },
            { path: "/log-management", name: "Log Management", icon: <History size={16} /> },
            { path: "/list-management", name: "List Management", icon: <ListTodo size={16} /> },
          ],
        },
      ],
    },
  ];

  // Auto-expand parent item if one of its children is active
  useEffect(() => {
    const initialOpen = { ...openSections };
    let hasUpdates = false;

    menu.forEach((section) => {
      section.links.forEach((link) => {
        if (link.isParent && link.children) {
          const isActiveChild = link.children.some(
            (child) => location.pathname === child.path || location.pathname.startsWith(child.path + "/")
          );
          if (isActiveChild && !openSections[link.name]) {
            initialOpen[link.name] = true;
            hasUpdates = true;
          }
        }
      });
    });

    if (hasUpdates) {
      setOpenSections(initialOpen);
    }
  }, [location.pathname]);

  const toggleSection = (name) => {
    setOpenSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <nav className="menu">
      {menu.map((section, index) => (
        <div key={index}>
          {section.section && <div className="section">{!isCollapsed && section.section}</div>}
          <ul>
            {section.links.map((link, linkIndex) => {
              // Handle nested parent menus
              if (link.isParent) {
                const isOpen = openSections[link.name];
                const hasActiveChild = link.children.some(
                  (child) => location.pathname === child.path || location.pathname.startsWith(child.path + "/")
                );

                if (isCollapsed) {
                  // Minimized sidebar parent item (with hover popover submenu)
                  return (
                    <li key={linkIndex} className="menu-item-parent collapsed-parent">
                      <div className="tooltip-container">
                        <button
                          type="button"
                          className={`menu-parent-btn justify-center ${hasActiveChild ? "parent-active" : "parent-inactive"}`}
                        >
                          {link.icon}
                        </button>
                        {/* Hover Popup Submenu */}
                        <div className="collapsed-submenu-popover">
                          <div className="popover-header">{link.name}</div>
                          {link.children.map((child, childIdx) => {
                            const isChildActive = location.pathname === child.path || location.pathname.startsWith(child.path + "/");
                            return (
                              <NavLink
                                key={childIdx}
                                to={child.path}
                                className={() =>
                                  isChildActive ? "popover-link active" : "popover-link inactive"
                                }
                              >
                                {child.icon}
                                <span>{child.name}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    </li>
                  );
                } else {
                  // Expanded sidebar parent item (with accordion submenu)
                  return (
                    <li key={linkIndex} className="menu-item-parent">
                      <button
                        type="button"
                        onClick={() => toggleSection(link.name)}
                        className={`menu-parent-btn ${hasActiveChild ? "parent-active" : "parent-inactive"}`}
                      >
                        <span className="menu-parent-icon-text">
                          {link.icon}
                          <span>{link.name}</span>
                        </span>
                        <ChevronDown
                          size={16}
                          className="chevron"
                          style={{
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        />
                      </button>
                      {isOpen && (
                        <ul className="submenu-list">
                          {link.children.map((child, childIdx) => (
                            <li key={childIdx} className="submenu-item">
                              <NavLink
                                to={child.path}
                                className={({ isActive }) =>
                                  isActive ? "active submenu-link" : "inactive submenu-link"
                                }
                              >
                                {child.icon}
                                <span>{child.name}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }
              }

              // Handle regular standalone menu items
              const badgeCount = link.path === "/notifications" ? unreadCount : 0;

              return (
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
                      {badgeCount > 0 && (
                        <span
                          className="menu-badge"
                          title={`${badgeCount} unread notification${badgeCount === 1 ? "" : "s"}`}
                        >
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </span>
                      )}
                    </NavLink>
                    {isCollapsed && <span className="tooltip">{link.name}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default LeftSideMenu;