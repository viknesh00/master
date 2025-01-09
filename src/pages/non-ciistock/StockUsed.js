import React, { useState, useEffect } from "react";
import { ReactComponent as TickButton } from "../../assets/svg/tickbutton.svg";
import { ReactComponent as CloseButton } from "../../assets/svg/closebutton.svg";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import * as XLSX from "xlsx";
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

const StockUsed = () => {
    const [showUpdateStockUsed, setShowUpdateStockUsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
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

    const filteredData = StockUsed_Data.filter((item) =>
        item["OrderNumber"].toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleInputChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
        setSelectedRows([]);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            setSelectedRows(paginatedData.map((item) => item["OrderNumber"]));
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
        selectedRows.includes(item["OrderNumber"])
    );

    const handleDownload = () => {
        const dataToExport = selectedRows.length
            ? filteredData.filter((item) => selectedRows.includes(item["OrderNumber"]))
            : filteredData;
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
        setShowStockUsed(prevState => !prevState);
    }

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

    const handleUpdateStockUsed = () => {
        setShowUpdateStockUsed(prevState => !prevState);
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    }
    return (
        <div>
            {showStockUsed && <AddStockUsed value={showStockUsed} handleOpenAddStockUsed={handleOpenAddStockUsed} />}
            {showUpdateStockUsed && <UpdateStockUsed value={showUpdateStockUsed} handleUpdateStockUsed={handleUpdateStockUsed} />}

            <div className="outer-firstsection">
                <div className="outer-firstsection-header">
                    <span className="outer-firstsection-title">Daa Office Standard Laptop - 14” Touch, i5, 16GB, 512GB D - HP EliteBook 840 - DE Keyboard</span>
                </div>
                <div className="outer-firstsection-actions">
                    <button className="outer-firstsection-download" onClick={handleDownload}>
                        <Download /> Download
                    </button>
                    <button className="outer-firstsection-add" onClick={handleOpenAddStockUsed}>
                        <Plus /> Add Used
                    </button>
                </div>
            </div>

            <div className="outer-secondsection">
                <div className="tabs">
                    <button className="tab-button active">View all</button>
                    <button className="tab-button">Working</button>
                    <button className="tab-button">Text</button>
                </div>
                <Search placeholder="Search" onChange={handleInputChange} />
            </div>
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
                    <div className="table-header text-left w-[20%]" onClick={() => handleSort("OrderNumber")}>
                        OrderNumber
                        {sortConfig.key === "OrderNumber" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[20%]" onClick={() => handleSort("ReturnLocation")}>
                        ReturnLocation
                        {sortConfig.key === "ReturnLocation" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[20%]" onClick={() => handleSort("ReturnDate")}>
                        ReturnDate
                        {sortConfig.key === "ReturnDate" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[20%]" onClick={() => handleSort("ItemQuantity")}>
                        ItemQuantity
                        {sortConfig.key === "ItemQuantity" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[10%]"></div>
                </div>

                {paginatedData.map((item, index) => (
                    <div key={index} className="div-data">
                        <div className="text-center w-[10%]">
                            <input
                                type="checkbox"
                                className="table-checkbox"
                                checked={selectedRows.includes(item["OrderNumber"])}
                                onChange={() => handleCheckboxChange(item["OrderNumber"])}
                            />
                        </div>
                        <div className="table-data text-left w-[20%]">{item["OrderNumber"]}</div>
                        <div className="table-data text-left w-[20%]">{item["ReturnLocation"]}</div>
                        <div className="table-data text-left w-[20%]">{item["ReturnDate"]}</div>
                        <div className="table-data text-left w-[20%]">{item["ItemQuantity"]}</div>
                        <div className="table-data text-center w-[10%]"><VerticalDot onClick={(event) => handleVerticalDotClick(event, item)} /></div>
                    </div>
                ))}
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
                        onClick={() => alert(`Delete ${alertBox.data["OrderNumber"]}`)}
                    >
                        <span><Delete /></span> Delete
                    </button>
                </div>
            )}

            <div className="table-footer">
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                />
            </div>
        </div>
    );
};

export default StockUsed;
