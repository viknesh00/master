    import React, { useState, useEffect } from "react";
    //import Navbar from "../components/Navbar";
    //import { Card, CardContent } from "../components/ui/card";
    import Datefielddashboard from "./utils/Datefielddashboard";
    import DashboardDatefield from "./utils/DashboardDatefield";
    import FilterDateField from "./utils/FilterDateField";
    import { CalendarIcon } from "lucide-react";
    import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
    import { CircularProgressbarWithChildren, CircularProgressbar, buildStyles } from "react-circular-progressbar";
    import "react-circular-progressbar/dist/styles.css";
    import { Margin } from "@mui/icons-material";
    import { ReactComponent as Packageplus } from "./assets/svg/packageplus.svg";
    import { ReactComponent as TickButton } from "./assets/svg/tickbutton.svg";
    import { ReactComponent as CloseButton } from "./assets/svg/closebutton.svg";
    import { getRequest, postRequest } from "./services/ApiService";
    import { useLocation } from "react-router-dom";
    import { useUser } from "./UserContext";
    import { useNavigate } from "react-router-dom";

    const CardContent = ({ children }) => (
        <div className="shadow-md rounded-md border p-4 ml-6 mr-6 mb-6 mt-6">{children}</div>
    );

    function NumericalStats(){
        const navigate = useNavigate();
        const { name } = useUser();
        const [formData, setFormData] = useState({});
        const [filterValue, setFilterValue] = useState({});
        const [fromDate, setFromDate] = useState(null);
        const [toDate, setToDate] = useState(null);
        const [inwardFrom, setInwardFrom] = useState("")
        const [resetSelect, setResetSelect] = useState(false);     
            const [pieCiiData, setCiiPieData] = useState([
                { name: "In Hand", value: 0, color: "#009E4C",totalStock : "" + "" + "" },
                { name: "New Stock", value: 0, color: "#046C7A",totalStock : "" + "" + "" },
                { name: "Used", value: 0, color: "#F28C00" },
                { name: "Defective", value: 0, color: "#E60000" },
                { name: "Total Returned", value: 0, color: "#046C7A" },
                { name: "Total Delivered", value: 0, color: "#5D36FF" }
            ]);
            const [pieNonCiiData, setNonCiiPieData] = useState([
                { name: "In Hand", value: 0, color: "#009E4C",totalStock : "" + "" + ""  },
                { name: "New Stock", value: 0, color: "#046C7A",totalStock : "" + "" + "" },
                { name: "Used", value: 0, color: "#F28C00" },
                { name: "Defective", value: 0, color: "#E60000" },
                { name: "Total Returned", value: 0, color: "#046C7A" },
                { name: "Total Delivered", value: 0, color: "#5D36FF" }
            ]);
            const [stockData, setStockData] = useState([
                { title: "CII Stock", delivered: 0, returned: 0 },
                { title: "Non-CII Stock", delivered: 0, returned: 0 }
            ]);
        
            const breadcrumbData = [
                { label: "Dashboard", path: "" },
            ];
        
            
            useEffect(() => {
                debugger
                fetchDashboarddata();
            },[]);
        
                const fetchDashboarddata = () => {  
                    const url = `SmInboundStockNonCiis/DashBoard/${name}`;
                    
                    postRequest(url)
                    .then((res) => {
                        if (res.status === 200) {
        
                            let ciiInhand = res.data.ciiCounts[0].inhandstock;
                            let ciiNewStock = res.data.ciiCounts[0].newstock;
                            let ciiUsed = res.data.ciiCounts[0].usedstock;
                            let ciiDefective = res.data.ciiCounts[0].defectivestock;
                            let ciiDeliveredCount = res.data.deliveryReturnCounts[0].ciiDeliveryCount;
                            let ciiReturnCount = res.data.deliveryReturnCounts[0].ciiReturnCount;
                            setCiiPieData([
                                { name: "In Hand", value: ciiInhand || 0, color: "#009E4C",totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "New Stock", value: ciiNewStock || 0, color: "#046C7A",totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "Used", value: ciiUsed || 0, color: "#F28C00", totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "Defective", value: ciiDefective || 0, color: "#E60000", totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "Total Returned", value: ciiReturnCount || 0, color: "#046C7A", totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "Total Outward", value: ciiDeliveredCount || 0, color: "#5D36FF", totalStock : ciiInhand + ciiUsed + ciiDefective }
                            ]);
                            let nonCiiInhand = res.data.nonCIICounts[0].inhandstock;
                            let nonCiiNewStock = res.data.nonCIICounts[0].newstock;
                            let nonCiiUsed = res.data.nonCIICounts[0].usedstock;
                            let nonCiiDefective = res.data.nonCIICounts[0].defectivestock;
                            let nonCiiDeliveredCount = res.data.deliveryReturnCounts[0].nonCIIDeliveryCount;
                            let nonCiiReturnCount = res.data.deliveryReturnCounts[0].nonCIIReturnCount;
                            setNonCiiPieData([
                                { name: "In Hand", value: nonCiiInhand || 0, color: "#009E4C", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "New Stock", value: nonCiiNewStock || 0, color: "#046C7A",totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "Used", value: nonCiiUsed || 0, color: "#F28C00", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "Defective", value: nonCiiDefective || 0, color: "#E60000", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "Total Returned", value: nonCiiReturnCount || 0, color: "#046C7A", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "Total Outward", value: nonCiiDeliveredCount || 0, color: "#5D36FF", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                            ])
                            setStockData([
                                { title: "CII Stock", delivered: ciiDeliveredCount || 0, returned: ciiReturnCount || 0 },
                                { title: "Non-CII Stock", delivered: nonCiiDeliveredCount || 0, returned: nonCiiReturnCount || 0 },
                            ])
                        }
                    })
                    .catch((error) => {
                        console.error("API Error:", error);
                    });
                };
        
        
            const circularData = [
                { label: "In Hand Stock", value: 4085, color: "#009E4C" },
                { label: "Used Stock", value: 1547, color: "#F28C00" },
                { label: "Defective Stock", value: 379, color: "#E60000" },
            ];

            const onSelectionChange = (value, field) => {
                setResetSelect(false)
                setFilterValue(prevState => ({
                    ...prevState,
                    [field]: value
                }));
            }
        
            const handleInputChange = (name, value) => {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: value,
                }));
            };

            const ciiStockStatus = ()=>{
                navigate("/cii-stock");
            }

            const nonCiiStockStatus = ()=>{
                navigate("/non-cii-stock");
            }

            const handleApplyFilter = () => {
                console.log(filterValue)
                setFromDate(filterValue.fromdate)
                setToDate(filterValue.todate)
                setInwardFrom(filterValue.inwardFrom);
            }
        
            const handleClearFilter = () => {
                setFromDate(null);
                setToDate(null);
                setInwardFrom("")
                setFilterValue({})
                setResetSelect(true)
            }
        
        return(
            <div>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <span className="p-2 bg-black text-white rounded-[6px] mr-2">
                                <Packageplus size={16} />
                            </span>
                            CII Stock
                        </h2>

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

                    <div className="grid grid-cols-7 gap-4 justify-center items-center">
                        <div className="flex items-center justify-center">
                            {pieCiiData.some(data => data.value > 0) ? (
                                <ResponsiveContainer width="100%" height={150} >
                                    <PieChart>
                                        <Pie
                                            data={pieCiiData}
                                            dataKey="value"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={0}
                                        >
                                            {pieCiiData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-500">No Data Found</p>
                            )}
                        </div>

                        {pieCiiData.map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="w-32 h-32 cursor-pointer" onClick={ciiStockStatus}>
                                    <CircularProgressbarWithChildren
                                        value={(item.value / item.totalStock) * 100}
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
                                            <p className="text-sm text-gray-500">{item.name}</p>
                                            <p className="font-semibold text-lg">{item.value}</p>
                                        </div>
                                    </CircularProgressbarWithChildren>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>

                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <span className="p-2 bg-black text-white rounded-[6px] mr-2">
                                <Packageplus size={16} />
                            </span>
                            Non-CII Stock
                        </h2>

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

                    <div className="grid grid-cols-7 gap-4 justify-center items-center">
                    <div className="flex items-center justify-center">
            {pieNonCiiData.some(data => data.value > 0) ? (
                <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                        <Pie
                            data={pieNonCiiData}
                            dataKey="value"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={0}
                        >
                            {pieNonCiiData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-gray-500">No Data Found</p>
            )}
        </div>

                        {pieNonCiiData.map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="w-32 h-32 cursor-pointer" onClick={nonCiiStockStatus}>
                                    <CircularProgressbarWithChildren
                                        value={(item.value / item.totalStock) * 100}
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
                                            <p className="text-sm text-gray-500">{item.name}</p>
                                            <p className="font-semibold text-lg">{item.value}</p>
                                        </div>
                                    </CircularProgressbarWithChildren>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                {/* <div className="flex gap-6 pt-0 px-6 pb-6 ">
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
                                        label="Inward Date"
                                        name="FromDate"
                                        value={formData.InwardDate}
                                        placeholder="From Date"
                                        onChange={handleInputChange}
                                    />
                                    <DashboardDatefield
                                        label="Inward Date"
                                        name="ToDate"
                                        value={formData.InwardDate}
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
                                </div>
                                <div className="w-32">
                                    <CircularProgressbarWithChildren
                                        value={100}
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
                                </div>
                            </div>
                        </div>
                    ))}
                </div> */}
            </div>        
            
        );
    }

    export default NumericalStats;