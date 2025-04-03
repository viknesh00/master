import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import StockCard from "../../utils/Stockcard";
import { ReactComponent as MinusSquare } from "../../assets/svg/minus-square.svg";
import { ReactComponent as PlusSquare } from "../../assets/svg/plus-square.svg";
import { ReactComponent as ActivityHeart } from "../../assets/svg/activity-heart.svg";
import StockInward from "./StockInward";
import StockDelivered from "./StockDelivered";
import StockReturned from "./StockReturned";
import StockUsed from "./StockUsed";
import { getRequest, postRequest } from "../../services/ApiService";

const NonciiMaterialDetail = () => {
    const location = useLocation();
    const materialNumber = location.pathname.split('/').pop();
    const [analyticsData, setAnalyticsData] = useState([]);
    const [isPanelVisible, setPanelVisible] = useState(true);
    const breadcrumbData = [
        { label: "Non-CII Stock", path: "/non-cii-stock" },
        { label: `${materialNumber}`, path: "" },
    ];
    const [activeTab, setActiveTab] = useState("Stock Inward");
    const tabs = [
        { label: "Stock Inward", icon: <ActivityHeart /> },
        { label: "Stock Outward", icon: <ActivityHeart /> },
        { label: "Stock Returned", icon: <ActivityHeart /> },
        { label: "Used Stock", icon: <ActivityHeart /> },
    ];

    useEffect(()=>{
        fetchMaterialAnalysiticsNonCiiData();
    }, []);

    const fetchMaterialAnalysiticsNonCiiData = () => {
            const url = `SmInboundStockNonCiis/AnalyticsNonCII/${materialNumber}`
            postRequest(url)
                .then((res) => {
                    if (res.status === 200) {
                        setAnalyticsData(res.data);
                    }
                })
                .catch((error) => {
                    console.error("API Error:", error);
                });
        }

    const togglePanel = () => {
        setPanelVisible(!isPanelVisible);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "Stock Inward":
                return <StockInward/>;
            case "Stock Outward":
                return <StockDelivered/>;
            case "Stock Returned":
                return <StockReturned/>
            case "Used Stock":
                return <StockUsed/>;
            default:
                return null;
        }
    };

    return (
        <div>
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                {/* <span className="main-title">{materialNumber}</span> */}

                <div className="dashboard-container">
                    <div className="toggle-btn-container">
                        <div onClick={togglePanel} className="toggle-btn">
                            {isPanelVisible ? <MinusSquare /> : <PlusSquare />}
                        </div>
                    </div>

                    {isPanelVisible && (
                        <div className="grid-container">
                            <StockCard title="Total Stock" value={analyticsData[0]?.totalstock || 0} bgColor="#000000" />
                            <StockCard title="New Stock" value={analyticsData[0]?.newstock || 0} bgColor="#039855" onClick={() => setActiveTab("Stock Inward")} />
                            <StockCard title="Used Stock" value={analyticsData[0]?.usedstock || 0} bgColor="#FF6600" onClick={() => setActiveTab("Used Stock")} />
                            <StockCard title="Outward Stock" value={analyticsData[0]?.deliverycount || 0} bgColor="#046C7A" onClick={() => setActiveTab("Stock Outward")} />
                            <StockCard title="BreakFix Stock" value={analyticsData[0]?.breakfixstock || 0} bgColor="#5D36FF" onClick={() => setActiveTab("Stock Returned")} />
                            <StockCard title="Damaged Stock" value={analyticsData[0]?.damagedstock || 0} bgColor="#DD0000" />
                        </div>
                    )}
                </div>

                <div className="switch-container">
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
        </div>
    );
};

export default NonciiMaterialDetail;
