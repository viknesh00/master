import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import Datefielddashboard from "./utils/Datefielddashboard";
import DashboardDatefield from "./utils/DashboardDatefield";
import FilterDateField from "./utils/FilterDateField";
import { ReactComponent as Packageplus } from "./assets/svg/packageplus.svg";
import { ReactComponent as TickButton } from "./assets/svg/tickbutton.svg";
import { ReactComponent as CloseButton } from "./assets/svg/closebutton.svg";
import { useState, useEffect } from "react";
import { getRequest, postRequest } from "./services/ApiService";
const data = [
  { month: "Jan", oilStock: 600, nonOilStock: 100 },
  { month: "Feb", oilStock: 620, nonOilStock: 120 },
  { month: "Mar", oilStock: 630, nonOilStock: 150 },
  { month: "Apr", oilStock: 640, nonOilStock: 180 },
  { month: "May", oilStock: 650, nonOilStock: 200 },
  { month: "Jun", oilStock: 660, nonOilStock: 250 },
  { month: "Jul", oilStock: 670, nonOilStock: 270 },
  { month: "Aug", oilStock: 680, nonOilStock: 300 },
  { month: "Sep", oilStock: 700, nonOilStock: 350 },
  { month: "Oct", oilStock: 720, nonOilStock: 370 },
  { month: "Nov", oilStock: 750, nonOilStock: 400 },
  { month: "Dec", oilStock: 780, nonOilStock: 450 },
];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CardContent = ({ children }) => (
    <div className="shadow-md rounded-md border p-4 ml-6 mr-6 mb-6 mt-6">{children}</div>
);
const GraphicalStats = () => {
    const [formData, setFormData] = useState({});
    const [filterValue, setFilterValue] = useState({});
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [inwardFrom, setInwardFrom] = useState("")
    const [resetSelect, setResetSelect] = useState(false);
    const [deliveryCount, setDeliveryCount] = useState([]);
    const [inwardCount, setInwardCount] = useState([]);

    useEffect(() => {
        fetchDashboardGraphData();
    }, []);

    const handleInputChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const fetchDashboardGraphData = async (fromDate, toDate) => {
        const url = `SmInboundStockNonCiis/DashBoardCharts`;
    
        try {
            const res = await postRequest(url);
            if (res.status === 200) {
                let deliveryData = res.data.ciiDeliveryCounts || [];
                let inwardData = res.data.ciiInwardCounts || [];
    
                // Default 12-month structure
                let defaultData = monthNames.map((month, index) => ({
                    month,
                    ciiStock: null,
                    nonCiiStock: null,
                    year: new Date().getFullYear(), // Default year
                }));
    
                // Process delivery data
                deliveryData.forEach((item) => {
                    let monthIndex = item.month - 1;
                    let year = item.year || new Date().getFullYear(); // Handle year if available
    
                    if (defaultData[monthIndex]) {
                        defaultData[monthIndex] = {
                            ...defaultData[monthIndex],
                            ciiStock: item.recordCount || null,
                            nonCiiStock:
                                res.data.nonCIIDeliveryCounts?.find((x) => x.month === item.month)?.recordCount || null,
                            year,
                        };
                    }
                });
    
                // Process inward data
                let inwardDataProcessed = monthNames.map((month, index) => ({
                    month,
                    ciiStock: null,
                    nonCiiStock: null,
                    year: new Date().getFullYear(),
                }));
    
                inwardData.forEach((item) => {
                    let monthIndex = item.month - 1;
                    let year = item.year || new Date().getFullYear();
    
                    if (inwardDataProcessed[monthIndex]) {
                        inwardDataProcessed[monthIndex] = {
                            ...inwardDataProcessed[monthIndex],
                            ciiStock: item.recordCount || null,
                            nonCiiStock:
                                res.data.nonCIIInwardCounts?.find((x) => x.month === item.month)?.recordCount || null,
                            year,
                        };
                    }
                });
    
                // **Filter based on selected date range**
                if (fromDate && toDate) {
                    defaultData = defaultData.filter(
                        (item) =>
                            new Date(`${item.year}-${item.month}-01`) >= new Date(fromDate) &&
                            new Date(`${item.year}-${item.month}-01`) <= new Date(toDate)
                    );
    
                    inwardDataProcessed = inwardDataProcessed.filter(
                        (item) =>
                            new Date(`${item.year}-${item.month}-01`) >= new Date(fromDate) &&
                            new Date(`${item.year}-${item.month}-01`) <= new Date(toDate)
                    );
                }
    
                // Update state
                setDeliveryCount(defaultData);
                setInwardCount(inwardDataProcessed);
            }
        } catch (error) {
            console.error("Error fetching graph data:", error);
        }
    };

    const displayedYear = filterValue.fromdate 
  ? new Date(filterValue.fromdate).getFullYear() 
  : new Date().getFullYear();


// Helper function to get the display year(s)
const getDisplayYear = () => {
    const currentYear = new Date().getFullYear();
    
    // Both dates are provided
    if (filterValue.fromdate && filterValue.todate) {
      const fromYear = new Date(filterValue.fromdate).getFullYear();
      const toYear = new Date(filterValue.todate).getFullYear();
      
      // Return a single year if both years are the same
      if (fromYear === toYear) {
        return fromYear;
      }
      // Return a range if they differ
      return `${fromYear} - ${toYear}`;
    }
    
    // If only one date is selected, use that one
    if (filterValue.fromdate) {
      return new Date(filterValue.fromdate).getFullYear();
    }
    if (filterValue.todate) {
      return new Date(filterValue.todate).getFullYear();
    }
    
    // Default to current year if no date is selected
    return currentYear;
  };
  
    
    const onSelectionChange = (value, field) => {
        setResetSelect(false)
        setFilterValue(prevState => ({
            ...prevState,
            [field]: value
        }));
    }

    const handleApplyFilter = () => {
        console.log(filterValue)
        setFromDate(filterValue.fromdate)
        setToDate(filterValue.todate)
        setInwardFrom(filterValue.inwardFrom);
        fetchDashboardGraphData(filterValue.fromdate, filterValue.todate);
    }

    const handleClearFilter = () => {
        setFromDate(null);
        setToDate(null);
        setInwardFrom("")
        setFilterValue({})
        setResetSelect(true)
        fetchDashboardGraphData(null, null);
    }
  return (
<div className="p-4 bg-white rounded-lg">
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                  {/* Heading Section */}
                  <h2 className="text-lg font-semibold flex items-center">
                      <span className="p-2 bg-black text-white rounded-[6px] mr-2">
                          <Packageplus size={16} />
                      </span>
                      Inward/Outward Stocks
                  </h2>

                  {/* Filter Section (Moved to Right) */}
                  <div className="flex items-center gap-2 ml-auto">
                      <FilterDateField
                          label="fromdate"
                          placeholder="From Date"
                          onSelectionChange={onSelectionChange}
                          maxDate={filterValue.todate}
                          resetSelect={resetSelect}
                      />
                      <FilterDateField
                          label="todate"
                          placeholder="To Date"
                          onSelectionChange={onSelectionChange}
                          minDate={filterValue.fromdate}
                          resetSelect={resetSelect}
                      />
                      {/* Buttons */}
                      <button className="tick-btn" onClick={handleApplyFilter}>
                          <TickButton />
                      </button>
                      <button className="reset-btn" onClick={handleClearFilter}>
                          <CloseButton />
                      </button>
                  </div>
              </div>


              {/* Graphs Section - Two Charts in One Row */}
              <div className="flex flex-col md:flex-row gap-4">
                  {/* First Graph */}
                  <div className="w-full md:w-1/2">
                      <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={inwardCount} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                              {/* <CartesianGrid strokeDasharray="3 3" /> */}
                                          {/* Show the year above the legend */}
                              <text x="50%" y="10" textAnchor="middle" dominantBaseline="middle" className="text-sm">
                                    {getDisplayYear()}
                              </text>
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />   
                              <Legend />
                              <Line type="monotone" dataKey="ciiStock" stroke="green" strokeWidth={2} name="CII Stock" />
                              <Line type="monotone" dataKey="nonCiiStock" stroke="blue" strokeWidth={2} name="Non-CII Stock" />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>

                    {/* Second Graph */}
                    <div className="w-full md:w-1/2">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={deliveryCount} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                                <text x="50%" y="10" textAnchor="middle" dominantBaseline="middle" className="text-sm">
                                    {getDisplayYear()}
                                </text>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="ciiStock" stroke="green" strokeWidth={2} name="CII Stock" />
                                <Line type="monotone" dataKey="nonCiiStock" stroke="blue" strokeWidth={2} name="Non-CII Stock" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </div>

  );
};

export default GraphicalStats;


