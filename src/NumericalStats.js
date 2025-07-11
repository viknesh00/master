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
                            let ciiDefective = res.data.ciiCounts[0].damagedstock;
                            let ciiDeliveredCount = res.data.ciiCounts[0].outwardstock;
                            let ciiBreakFixCount = res.data.deliveryReturnCounts[0].breakfixstock;
                            setCiiPieData([
                                { name: "In Hand", value: ciiInhand || 0, color: "#009E4C",totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "New Stock", value: ciiNewStock || 0, color: "#046C7A",totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "Used", value: ciiUsed || 0, color: "#F28C00", totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "Damaged", value: ciiDefective || 0, color: "#E60000", totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "BreakFix", value: ciiBreakFixCount || 0, color: "#046C7A", totalStock : ciiInhand + ciiUsed + ciiDefective },
                                { name: "Total Outward", value: ciiDeliveredCount || 0, color: "#5D36FF", totalStock : ciiInhand + ciiUsed + ciiDefective }
                            ]);
                            let nonCiiInhand = res.data.nonCIICounts[0].inhandstock;
                            let nonCiiNewStock = res.data.nonCIICounts[0].newstock;
                            let nonCiiUsed = res.data.nonCIICounts[0].usedstock;
                            let nonCiiDefective = res.data.nonCIICounts[0].damagedstock;
                            let nonCiiDeliveredCount = res.data.deliveryReturnCounts[0].nonCIIDeliveryCount;
                            let nonCiiReturnCount = res.data.deliveryReturnCounts[0].breakfixstock;
                            setNonCiiPieData([
                                { name: "In Hand", value: nonCiiInhand || 0, color: "#009E4C", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "New Stock", value: nonCiiNewStock || 0, color: "#046C7A",totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "Used", value: nonCiiUsed || 0, color: "#F28C00", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "Damaged", value: nonCiiDefective || 0, color: "#E60000", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "BreakFix", value: nonCiiReturnCount || 0, color: "#046C7A", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                                { name: "Total Outward", value: nonCiiDeliveredCount || 0, color: "#5D36FF", totalStock : nonCiiInhand + nonCiiUsed + nonCiiDefective },
                            ])
                            // setStockData([
                            //     { title: "CII Stock", delivered: ciiDeliveredCount || 0, returned: ciiReturnCount || 0 },
                            //     { title: "Non-CII Stock", delivered: nonCiiDeliveredCount || 0, returned: nonCiiReturnCount || 0 },
                            // ])
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

            const ciiStockStatus = (filterType) => {
              debugger
              navigate("/cii-stock", { state: { filter: filterType } });
              //navigate("/reports");
            };
            // const ciiStockStatus = ()=>{
            //     navigate("/cii-stock");
            //     //navigate("/reports");
            // }

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
            <div className="p-4 sm:p-6">
  {/* CII Stock */}
  <CardContent>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <h2 className="text-lg font-semibold flex items-center">
        <span className="p-2 bg-black text-white rounded-[6px] mr-2">
          <Packageplus size={16} />
        </span>
        CII Stock
      </h2>

      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 ml-auto">
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
        <button className="tick-btn" onClick={handleApplyFilter}>
          <TickButton />
        </button>
        <button className="reset-btn" onClick={handleClearFilter}>
          <CloseButton />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 justify-center items-center">
      <div className="flex items-center justify-center">
        {pieCiiData.some(data => data.value > 0) ? (
          <ResponsiveContainer width="100%" height={150}>
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
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 cursor-pointer"
            onClick={() => ciiStockStatus(item.name.toLowerCase().replace(" ", ""))}
          >
            <CircularProgressbarWithChildren
              value={(item.value / item.totalStock) * 100}
              styles={{
                path: { stroke: item.color },
                trail: { stroke: "#e6e6e6" },
              }}
            >
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500">{item.name}</p>
                <p className="font-semibold text-base sm:text-lg">{item.value}</p>
              </div>
            </CircularProgressbarWithChildren>
          </div>
        </div>
      ))}
    </div>
  </CardContent>

  {/* Non-CII Stock */}
  <CardContent>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <h2 className="text-lg font-semibold flex items-center">
        <span className="p-2 bg-black text-white rounded-[6px] mr-2">
          <Packageplus size={16} />
        </span>
        Non-CII Stock
      </h2>

      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 ml-auto">
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
        <button className="tick-btn" onClick={handleApplyFilter}>
          <TickButton />
        </button>
        <button className="reset-btn" onClick={handleClearFilter}>
          <CloseButton />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 justify-center items-center">
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
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 cursor-pointer"
            onClick={nonCiiStockStatus}
          >
            <CircularProgressbarWithChildren
              value={(item.value / item.totalStock) * 100}
              styles={{
                path: { stroke: item.color },
                trail: { stroke: "#e6e6e6" },
              }}
            >
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500">{item.name}</p>
                <p className="font-semibold text-base sm:text-lg">{item.value}</p>
              </div>
            </CircularProgressbarWithChildren>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</div>

            
        );
    }

    export default NumericalStats;