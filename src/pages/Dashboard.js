import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
//import { Card, CardContent } from "../components/ui/card";
import Datefielddashboard from "../utils/Datefielddashboard";
import DashboardDatefield from "../utils/DashboardDatefield";
import { CalendarIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CircularProgressbarWithChildren, CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Margin } from "@mui/icons-material";
import { ReactComponent as Packageplus } from "../assets/svg/packageplus.svg";
import { getRequest, postRequest } from "../services/ApiService";
import { ReactComponent as ActivityHeart } from "../assets/svg/activity-heart.svg";
import NumericalStats from "../NumericalStats";
import GraphicalStats from "../GraphicalStats";


const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("Numerical Stats");
        const tabs = [
            { icon: <ActivityHeart />, label: "Numerical Stats"  },
            { icon: <ActivityHeart />, label: "Graphical Stats", }
        ];

    const breadcrumbData = [
        { label: "Dashboard", path: "" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "Numerical Stats":
                return <NumericalStats/>;
            case "Graphical Stats":
                return <GraphicalStats/>;
            default:
                return null;
        }
    };

    return (
        <div>
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container p-6">
                <span className="main-title mb-6">Dashboard</span>
            </div>
            <div className="switch-container-dashboard">
                    {tabs.map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => setActiveTab(tab.label)}
                            className={`switch-button ${activeTab === tab.label ? "active" : ""}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            <div className="tab-content">
                    {renderTabContent()}
                </div>    
                        
        </div>
    );
};

export default Dashboard;
