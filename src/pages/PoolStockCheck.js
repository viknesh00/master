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
import DropdownField from "../utils/DropDown";
import UploadCsvFile from '../dialog/poolstockcheck-dialog/UploadCsvFile';

const PoolStockCheck = (props) => {
    debugger
    const { name } = useUser();
    const navigate = useNavigate();
    const breadcrumbData = [
        { label: "Pools Stock Check", path: "" },
    ];
    const [showUpload, setShowUpload] = useState(false);
    const [stockData, setStockData] = useState([]);
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
    const [recordMatched, setRecordMatched] = useState([]);

    useEffect(() => {
        fetchstockdata();
        const handleClickOutside = (event) => {
            if (!event.target.closest(".alert-box")) {
                handleCloseAlert();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [recordMatched]);

    const fetchstockdata = () => {
        debugger
        const url = `SmInboundStockCiis/GetSmInboundStockCiis/${name}`;

        getRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    debugger
                    const updatedData = res.data.map(item => {
                        const newStock = item.newstock || 0;
                        const used = item.usedstock || 0;
                        const inhand = newStock + used;
                        const damaged = item.damaged || 0;
                        const breakfix = item.breakFix || 0;
                        const status = inhand > 0 ? 'Available' : 'Not Available';
                        return { ...item, inhand, used, damaged, breakfix, status };
                    });

                    setStockData(updatedData); // Now always defined
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    };

    const filteredData = (recordMatched || []).filter((item) => {
        const query = searchQuery.toLowerCase();

        const materialMatch = item["excelMaterialNumber"]?.toString().toLowerCase().includes(query);

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
            setSelectedRows(paginatedData.map((item) => item["excelMaterialNumber"]));
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
        selectedRows.includes(item["excelMaterialNumber"])
    );

    const handleDownload = () => {
        debugger
        const keysToKeep = ["excelMaterialNumber", "poolName", "newstock", "usedstock", "damaged", "breakFix", "excelstatus"];
        const cleanedData = filteredData.map(item =>
            Object.fromEntries(
                keysToKeep
                    .filter(key => key in item) // Ensure the key exists in the object
                    .map(key => [key, item[key]]) // Reconstruct the object with keys in order
            )
        );
        const dataToExport = selectedRows.length
            ? cleanedData.filter((item) => selectedRows.includes(item["excelMaterialNumber"]))
            : cleanedData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CII Stock");
        XLSX.writeFile(workbook, "PoolStockCheck.xlsx");
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

    const handleOpenUploadStock = () => {
        
        if (showUpload) {
            //fetchMaterialDetails();
        }
        setShowUpload(prevState => !prevState);
    }

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
            {showUpload && <UploadCsvFile value={showUpload} setRecordMatched={setRecordMatched} handleOpenUploadStock={handleOpenUploadStock} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                {/* <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", width: "100%" }}> */}
                <span className="main-title">Pools Stock Check</span>
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
                        <span className="outer-firstsection-title">Pool Stock Check Counts</span>
                        <span className="outer-firstsection-subtitle">
                            {filteredData.length} Materials
                        </span>
                    </div>
                    <div className="outer-firstsection-actions">
                        {/* <div className="outer-secondsection"> */}
                        <div className="outer-firstsection-header">
                            {/* <DropdownField
                        label="Upload Type"
                        name="uploadType"
                        //value={formData.uploadType || "Bulk Upload"}
                        placeholder="Select Upload Type"
                        onChange={handleInputChange}
                        options={"Bulk Upload"}
                    /> */}
                                                {/* <FilterDateField
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
                                                </div> */}
                                            </div>
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
                        <button className="outer-firstsection-add" onClick={handleOpenUploadStock} disabled={isLimitedUser()} >
                            Upload Csv File
                        </button>
                    </div>
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
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("poolName")}>
                            Pool Name
                            {sortConfig.key === "poolName" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("excelMaterialNumber")}>
                            Excel Material Number
                            {sortConfig.key === "excelMaterialNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[13%]" onClick={() => handleSort("newstock")}>
                            New Stock
                            {sortConfig.key === "newstock" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[13%]" onClick={() => handleSort("usedstock")}>
                            Used Stock
                            {sortConfig.key === "usedstock" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("damaged")}>
                            Damaged
                            {sortConfig.key === "damaged" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("breakFix")}>
                            BreakFix
                            {sortConfig.key === "breakFix" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("excelStatus")}>
                            Excel Status
                            {sortConfig.key === "excelStatus" && (
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
                                        checked={selectedRows.includes(item["excelMaterialNumber"])}
                                        onChange={() => handleCheckboxChange(item["excelMaterialNumber"])}
                                    />
                                </div>
                                <div className="table-data text-hyper text-left w-[15%]" onClick={() => handleMaterialClick(item["materialNumber"], item["materialDescription"])}>{item["poolName"]}</div>
                                <div className="table-data text-left w-[25%]">{item["excelMaterialNumber"]}</div>
                                <div className="table-data text-left w-[10%]">{item["newstock"] ?? 0}</div>
                                <div className="table-data text-left w-[10%]">{item["usedstock"] ?? 0}</div>
                                <div className="table-data text-left w-[10%]
                                
                                
                                ">{item["damaged"] ?? 0}</div>
                                <div className="table-data text-left w-[10%]">{item["breakFix"] ?? 0}</div>
                                <div className="table-data text-left w-[10%]">{item["excelStatus"] ?? 0}</div>
                                {/* <div className="table-data text-left w-[15%]">
                                    <span className={`${item["status"] === "Available" ? "status-available" : item["status"] === "Not Available" ? "status-not-available" : "status-unknown"}`}>{item["status"]}</span>
                                </div> */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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
        
    );
};

export default PoolStockCheck;
