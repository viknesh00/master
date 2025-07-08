import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { ReactComponent as Download } from "../assets/svg/download.svg";
//import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import Search from "../utils/Search";
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
import * as XLSX from "xlsx";
import { ReactComponent as UpArrow } from "../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../assets/svg/down-arrow.svg";
//import { ReactComponent as VerticalDot } from "../../assets/svg/vertical-dot.svg";
import { ReactComponent as Edit } from "../assets/svg/edit.svg";
import { ReactComponent as Delete } from "../assets/svg/delete.svg";
import { useNavigate } from "react-router-dom";
import EditMaterial from "../dialog/ciistock-dialog/EditMaterial";
import { getRequest, postRequest } from "../services/ApiService";
import Addciistock from "../dialog/ciistock-dialog/Addciistock";
import { getCookie } from "../services/Cookies";
import { isLimitedUser } from '../services/Cookies';
import { useLocation } from "react-router-dom";
import { useUser } from "../UserContext";
//import CustomSelect from "../../utils/CustomSelect";
import { ToastError, ToastSuccess } from "../services/ToastMsg";
import FilterDateField from "../utils/FilterDateField";
import { ReactComponent as TickButton } from "../assets/svg/tickbutton.svg";
import { ReactComponent as CloseButton } from "../assets/svg/closebutton.svg";

const LogManagement = (props) => {
    const { name } = useUser();
    const navigate = useNavigate();
    const breadcrumbData = [
        { label: "Log Management", path: "" },
    ];
    const [LogRecordData, setLogRecordData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });
    const [alertBox, setAlertBox] = useState({ visible: false, x: 0, y: 0, data: null });
    const [showEditMaterial, setShowEditMaterial] = useState(false);
    const [activeTab, setActiveTab] = useState("View all");
    const [serialOptions, setSerialOptions] = useState([]);
    const [formData, setFormData] = useState({ serialNumber: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterValue, setFilterValue] = useState({});
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [inwardFrom, setInwardFrom] = useState("")
    const [resetSelect, setResetSelect] = useState(false);

    useEffect(() => {
        fetchlogdata();
        const handleClickOutside = (event) => {
            if (!event.target.closest(".alert-box")) {
                handleCloseAlert();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchlogdata = () => {
        const url = `SmInboundStockCiis/GetLogmanagementRecord`;
        
        getRequest(url)
          .then((res) => {
              if (res.status === 200) {
                  setLogRecordData(res.data)
              }
          })
          .catch((error) => {
              console.error("API Error:", error);
          });
    };

    const handleRemoveMaterial = (value) => {
        const url = `SmInboundStockCiis/${value}/${false}`
        postRequest(url)
          .then((res) => {
              if (res.status === 200) {
                ToastSuccess("Material Deleted Successfully");
                fetchlogdata();
              }
          })
          .catch((error) => {
              console.error("API Error:", error);
          });
    }

    const handleOpenAddMaterial = () => {
        if(showAddMaterial){
            fetchlogdata();
        }
        setShowAddMaterial(prevState => !prevState);
    };

    const handleOpenEditMaterial = () => {
        if(showEditMaterial){
            fetchlogdata();
        }
        setShowEditMaterial(prevState => !prevState);
    };

    const filteredData = LogRecordData.filter((item) => {
        const query = searchQuery.toLowerCase();
    
        const materialMatch = item["marterialNumber"]?.toString().toLowerCase().includes(query);
    
        const matchesSearch =
            materialMatch ||
            Object.values(item).some((value) =>
                String(value).toLowerCase().includes(query)
            );
        const inwardDate = new Date(item.inwardDate);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        const matchesDate =
        (!from && !to) ||
        (from && !to && inwardDate >= from) ||
        (!from && to && inwardDate <= to) ||
        (from && to && inwardDate >= from && inwardDate <= to);

    
        if (activeTab === "Available") {
            return matchesSearch && item["status"] === "Available";
        } else if (activeTab === "Not Available") {
            return matchesSearch && item["status"] === "Not Available";
        }
    
        return matchesSearch && matchesDate;
    });
    

    const isValidDate = (value) => {
        const date = new Date(value);
        return !isNaN(date);
    };

    const sortedData = [...filteredData].sort((a, b) => {
        if (sortConfig.key) {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (isValidDate(aValue) && isValidDate(bValue)) {
                const dateA = new Date(aValue);
                const dateB = new Date(bValue);
                return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
            } else if (!isNaN(aValue) && !isNaN(bValue)) {
                return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
            } else if (typeof aValue === "string" && typeof bValue === "string") {
                return sortConfig.direction === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
        }
        return 0;
    });

    const paginatedData = sortedData.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
    );

    const handleInputChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(0);
        setSelectedRows([]);
    };

    const handleApplyFilter = () => {
    setFromDate(filterValue.fromdate || null);
    setToDate(filterValue.todate || null);
    };

    const onSelectionChange = (value, field) => {
        setResetSelect(false)
        setFilterValue(prevState => ({
            ...prevState,
            [field]: value
        }));
    }




    const handleClearFilter = () => {
        setFromDate(null);
        setToDate(null);
        //setInwardFrom("")
        setFilterValue({})
        setResetSelect(true)
    }

    const getsearchValue = (value) => {
        if (!value.trim()) {
            setSerialOptions([]); // Clear dropdown if input is empty
            return;
          }
      
          console.log("API Call:", value); // Debugging: Check if API is being triggered
      
          const url = `SmInboundStockCiis/SearchSerialNumber/${name}/${value}`;
      
          postRequest(url)
            .then((res) => {
                if (res.status === 200 && res.data) {
  
                    const Options = [
                        ...new Set(res.data.map((item) => item)),
                    ].map((value) => ({ id: value, name: value.serialNumber }));
  
                    setSerialOptions(Options); // Update dropdown
                }
            })
            .catch((error) => {
              console.error("API Error:", error);
            });
    }

    // const handleMaterialClick = (value, field) =>{
    //     navigate(`/cii-stock/${value.id.materialNumber}`, { state: { materialDescription : value.id.materialDescription } });
    //     //navigate(`/cii-stock/${value.id.materialNumber}/${value.id.serialNumber}`, { state: { serialData : value.id, materialDescription : value.id.materialDescription } });
    // }

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            setSelectedRows(paginatedData.map((item) => item["marterialNumber"]));
        } else {
            setSelectedRows([]);
        }
    };

    const handleCheckboxChange = (materialNumber) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(materialNumber)
                ? prevSelectedRows.filter((item) => item !== materialNumber)
                : [...prevSelectedRows, materialNumber]
        );
    };

    const isAllSelected = selectedRows.length > 0 && paginatedData.every((item) =>
        selectedRows.includes(item["marterialNumber"])
    );

    const handleDownload = () => {
        debugger
        const keysToKeep = ["user_Id", "marterialNumber", "serialNumber", "modified_date", "activities", "exist_record", "new_record"];
        const cleanedData = filteredData.map(item =>
            Object.fromEntries(
                keysToKeep
                    .filter(key => key in item) // Ensure the key exists in the object
                    .map(key => [key, item[key]]) // Reconstruct the object with keys in order
            )
        );
        const dataToExport = selectedRows.length
            ? cleanedData.filter((item) => selectedRows.includes(item["marterialNumber"]))
            : cleanedData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CII Stock");
        XLSX.writeFile(workbook, "LogReport.xlsx");
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleMaterialClick = (materialNumber, materialDescription) => {
        navigate(`/cii-stock/${materialNumber}`, { state: { materialDescription } });
    };

    const handleVerticalDotClick = (event, item) => {
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        setAlertBox({
            visible: true,
            x: rect.left - 100,
            y: rect.bottom + window.scrollY + 10,
            data: item,
        });
    };

    const handleCloseAlert = () => {
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    };

        const formatDate = (dateString) => {
        if (!dateString) return ""; // Return empty string if dateString is null or undefined
    
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ""; // Return empty string if the date is invalid
    
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
    
        return `${day}/${month}/${year}`;
    };


    return (
        <div>
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                {/* <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", width: "100%" }}> */}
                    <span className="main-title">Log Management</span>
                    {/* <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <label>Search Serial Number:</label>
                        <CustomSelect
                            options={serialOptions}
                            placeholder="Search Serial Number"
                            getsearchValue={getsearchValue}
                            onSelectionChange={onSelectionChange}
                            //resetSelect={resetSelect}
                        />
                    </div> */}
                {/* </div> */}
                <div className="outer-firstsection">
                    <div className="outer-firstsection-header">
                        <span className="outer-firstsection-title">Log Counts</span>
                        <span className="outer-firstsection-subtitle">
                            {filteredData.length} Materials
                        </span>
                    </div>
                    {/* <div className="outer-firstsection-actions"> */}
                                        {/* <div className="outer-secondsection"> */}
                                            {/* <div className="outer-firstsection-header">
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
                                                <div className="outer-firstsection-actions">
                                                    <div className="tick-btn" onClick={handleApplyFilter}><TickButton /></div>
                                                    <div className="reset-btn" onClick={handleClearFilter}>
                                                        <CloseButton />
                                                    </div>
                                                </div>
                                            </div> */}
                                            {/* <div className="outer-firstsection-actions">
                                                <div className="tick-btn" onClick={handleApplyFilter}><TickButton /></div>
                                                <div className="reset-btn" onClick={handleClearFilter}>
                                                    <CloseButton />
                                                </div>
                                            </div> */}
                                        {/* </div> */}
                        <button className="outer-firstsection-download" onClick={handleDownload}>
                            <Download /> Download
                        </button>
                        {/* <button className="outer-firstsection-add" onClick={handleOpenAddMaterial} disabled={isLimitedUser()}>
                            <Plus /> Add Material
                        </button> */}
                    {/* </div> */}
                </div>
                <div className="outer-secondsection">
                    <div className="tabs">
                        <button
                            className={`tab-button ${activeTab === "View all" ? "active" : ""}`}
                            onClick={() => setActiveTab("View all")}
                        >
                            View all
                        </button>
                        <button
                            className={`tab-button ${activeTab === "Available" ? "active" : ""}`}
                            onClick={() => setActiveTab("Available")}
                        >
                            Available
                        </button>
                        <button
                            className={`tab-button ${activeTab === "Not Available" ? "active" : ""}`}
                            onClick={() => setActiveTab("Not Available")}
                        >
                            Not Available
                        </button>
                    </div>
                    <Search placeholder="Search" onChange={handleInputChange} />
                </div>

                <div className="div-table">
                    <div className="div-head">
                        <div className="text-center w-[5%]">
                            <input
                                type="checkbox"
                                className="table-checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAllChange}
                            />
                        </div>
                        <div className="table-header text-left w-[22%]" onClick={() => handleSort("user_Id")}>
                            User ID
                            {sortConfig.key === "user_Id" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("marterialNumber")}>
                            Material Number
                            {sortConfig.key === "marterialNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("serialNumber")}>
                            Serial Number
                            {sortConfig.key === "serialNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[13%]" onClick={() => handleSort("modified_date")}>
                            Modified Date
                            {sortConfig.key === "modified_date" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("activities")}>
                            Activities
                            {sortConfig.key === "activities" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("exist_record")}>
                            Exist Changes
                            {sortConfig.key === "exist_record" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("new_record")}>
                            New Changes
                            {sortConfig.key === "new_record" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                    {paginatedData.map((item, index) => (
                        <div key={index} className="div-data">
                            <div className="text-center w-[5%]">
                                <input
                                    type="checkbox"
                                    className="table-checkbox"
                                    checked={selectedRows.includes(item["materialNumber"])}
                                    onChange={() => handleCheckboxChange(item["materialNumber"])}
                                />
                            </div>
                            <div className="table-data text-hyper text-left w-[22%]">{item["user_Id"]}</div>
                            <div className="table-data text-left w-[20%]">{item["marterialNumber"]}</div>
                            <div className="table-data text-left w-[15%]">{item["serialNumber"]}</div>
                            <div className="table-data text-left w-[13%]">{formatDate(item["modified_date"])}</div>
                            <div className="table-data text-left w-[15%]">{item["activities"]}</div> 
                            <div className="table-data text-left w-[15%]">{item["exist_record"]}</div>
                            <div className="table-data text-left w-[15%]">{item["new_record"]}</div>

                            {/* <div className="table-data text-left w-[15%]">
                                <span className={`${item["status"] === "Available" ? "status-available" : item["status"] === "Not Available" ? "status-not-available" : "status-unknown"}`}>{item["status"]}</span>
                            </div> */}
                            {/* <div className="table-data text-center w-[5%]">
                                <VerticalDot
                                    onClick={(event) => {
                                        if (!isLimitedUser()) {
                                            handleVerticalDotClick(event, item);
                                        }
                                    }}
                                    className={isLimitedUser() ? "cursor-not-allowed" : "cursor-pointer"}
                                />
                            </div> */}
                        </div>
                    ))}
                </div>
                </div>

                {alertBox.visible && (
                    <div
                        className="alert-box"
                        style={{
                            top: alertBox.y,
                            left: alertBox.x,
                        }}
                    >
                        <button
                            className="dropdown-item"
                            onClick={() => setShowEditMaterial(true)}
                        >
                            <span><Edit /></span> Edit
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => handleRemoveMaterial(alertBox.data["materialNumber"])}
                        >
                            <span><Delete /></span> Delete
                        </button>
                    </div>
                )}
                <div className="table-footer">
                    <div className="table-pagination">
                        <Pagination
                            count={Math.ceil(sortedData.length / rowsPerPage)}
                            page={currentPage + 1}
                            onChange={(event, value) => handlePageChange(event, value - 1)}
                            variant="outlined"
                            shape="rounded"
                        />
                    </div>
                    <TablePagination
                        component="div"
                        count={sortedData.length}
                        page={currentPage}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        nextIconButtonProps={{ style: { display: 'none' } }}
                        backIconButtonProps={{ style: { display: 'none' } }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LogManagement;
