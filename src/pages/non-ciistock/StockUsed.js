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
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import StockUsed_Data from "../../data/stock_used.json";
import FilterDateField from "../../utils/FilterDateField";
import CustomSelect from "../../utils/CustomSelect";
import AddStockUsed from "../../dialog/nonciistock-dialog/AddStockUsed";
import UpdateStockUsed from "../../dialog/nonciistock-dialog/UpdateStockUsed";
import { getRequest, postRequest } from "../../services/ApiService";
import { getCookie } from "../../services/Cookies";
import { isLimitedUser } from '../../services/Cookies';
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const StockUsed = () => {
    const location = useLocation();
    const materialNumber = location.pathname.split('/').pop();
    const { materialDescription } = location.state || {};
    const [showUpdateStockUsed, setShowUpdateStockUsed] = useState(false);
    const [materialData, setMaterilaData] = useState([]);
    const [selectedMaterialData, setSelectedMaterialData] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [showStockUsed, setShowStockUsed] = useState(false);
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
        fetchMaterialDetails();
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
        const url = `SmInboundStockNonCiis/GetNonStockUsedData/${materialNumber}`
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

    const formatDate = (dateString) => {
        if (!dateString) return ""; // Return empty string if dateString is null or undefined
    
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ""; // Return empty string if the date is invalid
    
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
    
        return `${day}/${month}/${year}`;
    };

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
        const keysToKeep = ["orderNumber", "returnLocation", "returnDate", "itemQuantity"];
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Used");
        XLSX.writeFile(workbook, "Stock_Used.xlsx");
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleOpenAddStockUsed = () => {
        if(showStockUsed){
            fetchMaterialDetails();
        }
        setShowStockUsed(prevState => !prevState);
    }
    const handleRemoveMaterial = (orderNumber) => {
        const url = `SmInboundStockNonCiis/DeleteNonStockUsedData/${materialNumber}/${orderNumber}`
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

    const handleUpdateStockUsed = () => {
        if(showUpdateStockUsed){
            fetchMaterialDetails();
        }
        setShowUpdateStockUsed(prevState => !prevState);
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    }
    return (
        <div>
            {showStockUsed && <AddStockUsed value={showStockUsed} materialNumber={materialNumber} materialDescription={materialDescription} handleOpenAddStockUsed={handleOpenAddStockUsed} />}
            {showUpdateStockUsed && <UpdateStockUsed value={showUpdateStockUsed} materialNumber={materialNumber} materialDescription={materialDescription} selectedMaterialData={selectedMaterialData} handleUpdateStockUsed={handleUpdateStockUsed} />}

            <div className="outer-firstsection">
                <div className="outer-firstsection-header">
                <span className="outer-firstsectioncii-title">{materialNumber}</span><span className="outer-firstsectioncii-title">-{materialDescription}</span>
                </div>
                <div className="outer-firstsection-actions">
                    <Search placeholder="Search" onChange={handleInputChange} />
                    <button className="outer-firstsection-download" onClick={handleDownload}>
                        <Download /> Download
                    </button>
                    <button className="outer-firstsection-add" onClick={handleOpenAddStockUsed} disabled={isLimitedUser()}>
                        <Plus /> Add Used
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
                    <div className="text-center w-[10%]">
                        <input
                            type="checkbox"
                            className="table-checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAllChange}
                        />
                    </div>
                    <div className="table-header text-left w-[20%]" onClick={() => handleSort("orderNumber")}>
                        OrderNumber
                        {sortConfig.key === "orderNumber" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[20%]" onClick={() => handleSort("returnLocation")}>
                        ReturnLocation
                        {sortConfig.key === "returnLocation" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[20%]" onClick={() => handleSort("returnDate")}>
                        ReturnDate
                        {sortConfig.key === "returnDate" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[20%]" onClick={() => handleSort("itemQuantity")}>
                        ItemQuantity
                        {sortConfig.key === "itemQuantity" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[10%]"></div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {paginatedData.map((item, index) => (
                        <div key={index} className="div-data">
                            <div className="text-center w-[10%]">
                                <input
                                    type="checkbox"
                                    className="table-checkbox"
                                    checked={selectedRows.includes(item["orderNumber"])}
                                    onChange={() => handleCheckboxChange(item["orderNumber"])}
                                />
                            </div>
                            <div className="table-data text-left w-[20%]">{item["orderNumber"]}</div>
                            <div className="table-data text-left w-[20%]">{item["returnLocation"]}</div>
                            <div className="table-data text-left w-[20%]">{formatDate(item["returnDate"])}</div>
                            <div className="table-data text-left w-[20%]">{item["itemQuantity"]}</div>
                            <div className="table-data text-center w-[10%]">
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
                        onClick={() => handleUpdateStockUsed()}
                    >
                        <span><Edit /></span> Edit
                    </button>
                    <button
                        className="dropdown-item"
                        onClick={() => handleRemoveMaterial(alertBox.data["orderNumber"])}
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
    );
};

export default StockUsed;
