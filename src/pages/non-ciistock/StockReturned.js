import React, { useState, useEffect } from "react";
import { ReactComponent as TickButton } from "../../assets/svg/tickbutton.svg";
import { ReactComponent as CloseButton } from "../../assets/svg/closebutton.svg";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
import * as XLSX from "xlsx";
import { useLocation } from "react-router-dom";
import { ReactComponent as UpArrow } from "../../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../../assets/svg/down-arrow.svg";
import { ReactComponent as VerticalDot } from "../../assets/svg/vertical-dot.svg";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import { ReactComponent as Edit } from "../../assets/svg/edit.svg";
import { ReactComponent as FlipForward } from "../../assets/svg/flip-forward.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import StockReturned_Data from "../../data/stock_returned.json";
import FilterDateField from "../../utils/FilterDateField";
import CustomSelect from "../../utils/CustomSelect";
import MovedAlert from "../../dialog/MovedAlert";
import AddStockReturned from "../../dialog/nonciistock-dialog/AddStockReturned";
import UpdateStockReturned from "../../dialog/nonciistock-dialog/UpdateStockReturned";
import { getRequest, postRequest } from "../../services/ApiService";
import { getCookie } from "../../services/Cookies";
import { isLimitedUser } from '../../services/Cookies';
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const StockReturned = () => {
    const location = useLocation();
    const materialNumber = location.pathname.split('/').pop();
    const { materialDescription } = location.state || {};
    const [showMovetoused, setShowMovedtoused] = useState(false);
    const [showUpdateStockReturned, setShowUpdateStockReturned] = useState(false);
    const [selectedMaterialData, setSelectedMaterialData] = useState("");
    const [materialData, setMaterilaData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [showStockReturned, setShowStockReturned] = useState(false);
    const [alertBox, setAlertBox] = useState({ visible: false, x: 0, y: 0, data: null });
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });

    const options = [
        { id: 1, name: "Option 1" },
        { id: 2, name: "Option 2" },
        { id: 3, name: "Option 3" },
        { id: 4, name: "Option 4" },
        { id: 5, name: "Option 5" },
    ];

    useEffect(() => {
        fetchMaterialDetails()
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

    const fetchMaterialDetails = () => {
                    const url = `SmInboundStockNonCiis/GetNonStockReturnData/${materialNumber}`
                    postRequest(url)
                        .then((res) => {
                            if (res.status === 200) {
                                setMaterilaData(res.data);
                            }
                        })
                        .catch((error) => {
                            console.error("API Error:", error);
                        });
    }

    const filteredData = materialData.filter((item) =>
        item["orderNumber"].toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isValidDate = (value) => {
        const date = new Date(value);
        return !isNaN(date);
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

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            setSelectedRows(paginatedData.map((item) => item["orderNumber"])); 
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
        selectedRows.includes(item["orderNumber"])
    );

    const handleDownload = () => {
        const keysToKeep = ["orderNumber", "locationReturnedFrom", "returnedDate", "qunatity", "returnedBy", "rackLocation","returnType","returnReason"];
        const cleanedData = filteredData.map(item =>
            Object.fromEntries(
                keysToKeep
                    .filter(key => key in item) // Ensure the key exists in the object
                    .map(key => [key, item[key]]) // Reconstruct the object with keys in order
            )
        );
        const dataToExport = selectedRows.length
            ? cleanedData.filter((item) => selectedRows.includes(item["orderNumber"]))
            : cleanedData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Returned");
        XLSX.writeFile(workbook, "Stock_Returned.xlsx");
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleOpenAddReturn = () => {
        if(setShowStockReturned){
            fetchMaterialDetails();
        }
        setShowStockReturned(prevState => !prevState);
    }

    const handleRemoveMaterial = (orderNumber) => {
        const url = `SmInboundStockNonCiis/DeleteNonStockReturnData/${materialNumber}/${orderNumber}`
        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Deleted Successfuly");
                    fetchMaterialDetails();
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }

    const handleVerticalDotClick = (event, item) => {
        debugger
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        setSelectedMaterialData(item);
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

    const handlemovedtoused = (orderNumber) => {
        debugger
        const url = `SmInboundStockNonCiis/UpdateNonStockReturnType/${materialNumber}/${orderNumber}`
        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    //alert("Moved to Used Successfuly");
                    fetchMaterialDetails();
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
        setShowMovedtoused(prevState => !prevState);
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    }

    const handleUpdateStockReturned = () => {
        if(showUpdateStockReturned){
            fetchMaterialDetails();
        }
        setShowUpdateStockReturned(prevState => !prevState);
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    }
    return (
        <div>
            {showStockReturned && <AddStockReturned value={showStockReturned} materialNumber={materialNumber} materialDescription={materialDescription} handleOpenAddReturn={handleOpenAddReturn} />}
            {showMovetoused && <MovedAlert value={showMovetoused} handlemovedtoused={handlemovedtoused} />}
            {showUpdateStockReturned && <UpdateStockReturned value={showUpdateStockReturned} materialNumber={materialNumber} materialDescription={materialDescription} selectedMaterialData={selectedMaterialData} handleUpdateStockReturned={handleUpdateStockReturned} />}
            <div className="outer-firstsection">
                <div className="outer-firstsection-header">
                <span className="outer-firstsectioncii-title">{materialNumber}</span><span className="outer-firstsectioncii-title">-{materialDescription}</span>
                </div>
                <div className="outer-firstsection-actions">
                    <Search placeholder="Search" onChange={handleInputChange} />
                    <button className="outer-firstsection-download" onClick={handleDownload}>
                        <Download /> Download
                    </button>
                    <button className="outer-firstsection-add" onClick={handleOpenAddReturn} disabled={isLimitedUser()}>
                        <Plus /> Add Return
                    </button>
                </div>
            </div>

            {/* <div className="outer-secondsection">
                <div >
                    {/* <button className="tab-button active">View all</button>
                    <button className="tab-button">Working</button>
                    <button className="tab-button">Text</button>
                </div>
                <Search placeholder="Search" onChange={handleInputChange} />
            </div> */}
            <div className="outer-secondsection">
                <div className="outer-firstsection-header">
                    <FilterDateField
                        placeholder="From Date"
                        onChange={handleInputChange}
                    />
                    <FilterDateField
                        placeholder="To Date"
                        onChange={handleInputChange}
                    />
                    <CustomSelect
                        options={options}
                        placeholder="Return Location"
                        onSelectionChange={handleInputChange}
                    />
                    <CustomSelect
                        options={options}
                        placeholder="Return Type"
                        onSelectionChange={handleInputChange}
                    />
                </div>
                <div className="outer-firstsection-actions">
                    <div className="tick-btn"><TickButton /></div>
                    <div className="reset-btn">
                        <CloseButton />
                    </div>
                </div>
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
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("orderNumber")}>
                    OrderNumber
                        {sortConfig.key === "orderNumber" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("locationReturnedFrom")}>
                    ReturnLocation
                        {sortConfig.key === "locationReturnedFrom" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("returnedDate")}>
                    ReturnDate
                        {sortConfig.key === "returnedDate" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("qunatity")}>
                    ReturnQuantity
                        {sortConfig.key === "qunatity" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("returnedBy")}>
                    ReceivedBy
                        {sortConfig.key === "returnedBy" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("rackLocation")}>
                    RackLocation
                        {sortConfig.key === "rackLocation" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("returnType")}>
                    ReturnType
                        {sortConfig.key === "returnType" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("returnReason")}>
                    Reason
                        {sortConfig.key === "returnReason" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    {/* <div className="table-header text-left w-[15%]" onClick={() => handleSort("RetrievedBy")}>
                    ReceivedBy
                        {sortConfig.key === "RetrievedBy" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div> */}
                    <div className="table-header text-left w-[5%]"></div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {paginatedData.map((item, index) => (
                        <div key={index} className="div-data">
                            <div className="text-center w-[5%]">
                                <input
                                    type="checkbox"
                                    className="table-checkbox"
                                    checked={selectedRows.includes(item["orderNumber"])}
                                    onChange={() => handleCheckboxChange(item["orderNumber"])}
                                />
                            </div>
                            <div className="table-data text-left w-[15%]">{item["orderNumber"]}</div>
                            <div className="table-data text-left w-[15%]">{item["locationReturnedFrom"]}</div>
                            <div className="table-data text-left w-[15%]">{formatDate(item["returnedDate"])}</div>
                            <div className="table-data text-left w-[15%]">{item["qunatity"]}</div>
                            <div className="table-data text-left w-[15%]">{item["returnedBy"]}</div>
                            <div className="table-data text-left w-[15%]">{item["rackLocation"]}</div>
                            <div className="table-data text-left w-[15%]">{item["returnType"]}</div>
                            <div className="table-data text-left w-[15%]">{item["returnReason"]}</div>
                            {/* <div className="table-data text-left w-[15%]">{item["RetrievedBy"]}</div> */}
                            <div className="table-data text-center w-[5%]">
                                <VerticalDot
                                    onClick={(event) => {
                                        if (!isLimitedUser()) {
                                            handleVerticalDotClick(event, item);
                                        }
                                    }}
                                    className={isLimitedUser() ? "cursor-not-allowed" : "cursor-pointer"}
                                />
                            </div>
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
                            onClick={() => handleUpdateStockReturned()}
                        >
                            <span><Edit /></span> Edit
                        </button>
                    <button
                        className="dropdown-item"
                        onClick={() => handleRemoveMaterial(alertBox.data["orderNumber"])}
                    >
                        <span><Delete /></span> Delete
                    </button>
                    <button
                        className="dropdown-item"
                        onClick={() => handlemovedtoused(alertBox.data["orderNumber"])}
                    >
                        <span><FlipForward /></span> Move to Used
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
    );
};

export default StockReturned;
