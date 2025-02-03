import React, { useState } from "react";
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

const Card = ({ children }) => (
    <div className="shadow-md rounded-md border p-4">{children}</div>
);

const CardContent = ({ children }) => (
    <div className="shadow-md rounded-md border p-4 ml-6 mr-6 mb-6">{children}</div>
);


const Input = (props) => (
    <input
        {...props}
        className="border rounded-md px-2 py-1 focus:outline-none focus:ring"
    />
);


const Dashboard = () => {

    const [formData, setFormData] = useState({});
    const breadcrumbData = [
        { label: "Dashboard", path: "" },
    ];

    const pieData = [
        { name: "In Hand", value: 65, color: "#009E4C" },
        { name: "Used", value: 25, color: "#F28C00" },
        { name: "Defective", value: 10, color: "#E60000" },
    ];

    const circularData = [
        { label: "In Hand Stock", value: 4085, color: "#009E4C" },
        { label: "Used Stock", value: 1547, color: "#F28C00" },
        { label: "Defective Stock", value: 379, color: "#E60000" },
    ];

    const stockData = [
        {
          title: "CII Stock",
          delivered: 4085,
          returned: 475,
        },
        {
          title: "Non-CII Stock",
          delivered: 3974,
          returned: 286,
        },
      ];

    const handleInputChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <div>
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container p-6">
                <span className="main-title mb-6">Dashboard</span>
            </div>
                        <CardContent>
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-semibold flex items-center">
                                    <span className="p-2 bg-black text-white rounded-[6px] mr-2">
                                        <Packageplus size={16} />
                                    </span>
                                    CII Stock
                                </h2>

                                <div className="flex space-x-2">
                                        <Datefielddashboard
                                            //label="Inward Date"
                                            name="FromDate"
                                            //value={formData.InwardDate}
                                            placeholder="From Date"
                                            onChange={handleInputChange}
                                        />
                                        <Datefielddashboard
                                            //label="Inward Date"
                                            name="ToDate"
                                            //value={formData.InwardDate}
                                            placeholder="To Date"
                                            onChange={handleInputChange}
                                        />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {circularData.map((item, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className="w-32 h-32">
                                            <CircularProgressbarWithChildren
                                                value={(item.value / 5000) * 100}
                                                styles={{
                                                    path: {
                                                        stroke: item.color,
                                                    },
                                                    trail: {
                                                        stroke: "#e6e6e6",
                                                    },
                                                }}
                                            >
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-500">{item.label}</p>
                                                    <p className="font-semibold text-lg">{item.value}</p>
                                                </div>
                                            </CircularProgressbarWithChildren>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>

                        <CardContent>
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-semibold flex items-center">
                                    <span className="p-2 bg-black text-white rounded-[6px] mr-2">
                                        <Packageplus size={16} />
                                    </span>
                                    Non-CII Stock
                                </h2>

                                <div className="flex space-x-2">
                                        <Datefielddashboard
                                            //label="Inward Date"
                                            name="FromDate"
                                            //value={formData.InwardDate}
                                            placeholder="From Date"
                                            onChange={handleInputChange}
                                        />
                                        <Datefielddashboard
                                            //label="Inward Date"
                                            name="ToDate"
                                            //value={formData.InwardDate}
                                            placeholder="To Date"
                                            onChange={handleInputChange}
                                        />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {circularData.map((item, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className="w-32 h-32">
                                            <CircularProgressbarWithChildren
                                                value={(item.value / 5000) * 100}
                                                styles={{
                                                    path: {
                                                        stroke: item.color,
                                                    },
                                                    trail: {
                                                        stroke: "#e6e6e6",
                                                    },
                                                }}
                                            >
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-500">{item.label}</p>  
                                                    <p className="font-semibold text-lg">{item.value}</p>
                                                </div>
                                            </CircularProgressbarWithChildren>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
            <div className="flex gap-6 pt-0 px-6 pb-6 ">
                {stockData.map((stock, index) => (
                    <div
                        key={index}
                        className="shadow-md rounded-md border bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-black text-white rounded-[6px] mr-2">
                                    <Packageplus size={16} />
                                </span>
                                <h2 className="font-semibold text-lg">{stock.title}</h2>
                            </div>
                            <div className="flex space-x-2">
                                        <DashboardDatefield
                                            //label="Inward Date"
                                            name="FromDate"
                                            //value={formData.InwardDate}
                                            placeholder="From Date"
                                            onChange={handleInputChange}
                                        />
                                        <DashboardDatefield
                                            //label="Inward Date"
                                            name="ToDate"
                                            //value={formData.InwardDate}
                                            placeholder="To Date"
                                            onChange={handleInputChange}
                                        />
                                </div>
                        </div>

                        <div className="flex justify-around items-center">
                            <div className="w-32">
                                <CircularProgressbarWithChildren
                                    value={100}
                                    styles={buildStyles({
                                        pathColor: "#046C7A",
                                        textColor: "#000",
                                        trailColor: "#f0f0f0",
                                    })}
                                >
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Total Delivered</p>
                                        <p className="font-semibold text-lg">{stock.delivered}</p>
                                    </div>
                                </CircularProgressbarWithChildren>
                                {/* <CircularProgressbar
                                    value={100}
                                    text={`${stock.delivered}`}
                                    styles={buildStyles({
                                        pathColor: "#008080",
                                        textColor: "#000",
                                        trailColor: "#f0f0f0",
                                    })}
                                />
                                <p className="text-center text-sm font-medium mt-2">
                                    Total Delivered
                                </p> */}
                            </div>
                            <div className="w-32">
                                <CircularProgressbarWithChildren
                                    value={30}
                                    styles={buildStyles({
                                        pathColor: "#5D36FF",
                                        textColor: "#000",
                                        trailColor: "#f0f0f0",
                                    })}
                                >
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Total Returned</p>
                                        <p className="font-semibold text-lg">{stock.returned}</p>
                                    </div>
                                </CircularProgressbarWithChildren>
                                {/* <CircularProgressbar
                                    value={30}
                                    text={`${stock.returned}`}
                                    styles={buildStyles({
                                        pathColor: "#6a0dad",
                                        textColor: "#000",
                                        trailColor: "#f0f0f0",
                                    })}
                                />
                                <p className="text-center text-sm font-medium mt-2">
                                    Total Returned
                                </p> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

                        
        </div>
    );
};

export default Dashboard;
