import React from "react";
import Navbar from "../components/Navbar";

const Dashboard = () => {
    const breadcrumbData = [
        { label: "Dashboard", path: "" },
    ];
    return (
        <div>
            <Navbar breadcrumbs={breadcrumbData} />
        </div>
    );
};

export default Dashboard;
