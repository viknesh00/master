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
import StockDelivered_Data from "../../data/stock_delivered.json";
import FilterDateField from "../../utils/FilterDateField";
import CustomSelect from "../../utils/CustomSelect";
import AddStockDelivered from "../../dialog/nonciistock-dialog/AddStockDelivered";
import UpdateStockDelivered from "../../dialog/nonciistock-dialog/UpdateStockDelivered";

const StockDelivered = () => {
    const [showUpdateStockDelivered, setShowUpdateStockDelivered] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [showAddDelivered, setShowAddDelivered] = useState(false);
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

    const filteredData = StockDelivered_Data.filter((item) =>
        item["Order Number"].toLowerCase().includes(searchQuery.toLowerCase())
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
            setSelectedRows(paginatedData.map((item) => item["Order Number"]));
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
        selectedRows.includes(item["Order Number"])
    );

    const handleDownload = () => {
        const dataToExport = selectedRows.length
            ? filteredData.filter((item) => selectedRows.includes(item["Order Number"]))
            : filteredData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Delivered");
        XLSX.writeFile(workbook, "Stock_Delivered.xlsx");
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleOpenAddDelivery = () => {
        setShowAddDelivered(prevState => !prevState);
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

    const handleUpdateStockDelivered = () => {
        setShowUpdateStockDelivered(prevState => !prevState);
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    }
    return (
        <div>
            {showAddDelivered && <AddStockDelivered value={showAddDelivered} handleOpenAddDelivery={handleOpenAddDelivery} />}
            {showUpdateStockDelivered && <UpdateStockDelivered value={showUpdateStockDelivered} handleUpdateStockDelivered={handleUpdateStockDelivered} />}

            <div className="outer-firstsection">
                <div className="outer-firstsection-header">
                    <span className="outer-firstsection-title">Daa Office Standard Laptop - 14” Touch, i5, 16GB, 512GB D - HP EliteBook 840 - DE Keyboard</span>
                </div>
                <div className="outer-firstsection-actions">
                    <button className="outer-firstsection-download" onClick={handleDownload}>
                        <Download /> Download
                    </button>
                    <button className="outer-firstsection-add" onClick={handleOpenAddDelivery}>
                        <Plus /> Add Delivery
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
                        placeholder="Target Location"
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
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("Order Number")}>
                        Order Number
                        {sortConfig.key === "Order Number" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("Outbound Date")}>
                        Outbound Date
                        {sortConfig.key === "Outbound Date" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("Receiver Name")}>
                        Receiver Name
                        {sortConfig.key === "Receiver Name" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("Target Location")}>
                        Target Location
                        {sortConfig.key === "Target Location" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("Quantity Delivered")}>
                        Quantity Delivered
                        {sortConfig.key === "Quantity Delivered" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("Sent By")}>
                        Sent By
                        {sortConfig.key === "Sent By" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[5%]"></div>
                </div>

                {paginatedData.map((item, index) => (
                    <div key={index} className="div-data">
                        <div className="text-center w-[5%]">
                            <input
                                type="checkbox"
                                className="table-checkbox"
                                checked={selectedRows.includes(item["Order Number"])}
                                onChange={() => handleCheckboxChange(item["Order Number"])}
                            />
                        </div>
                        <div className="table-data text-left w-[15%]">{item["Order Number"]}</div>
                        <div className="table-data text-left w-[15%]">{item["Outbound Date"]}</div>
                        <div className="table-data text-left w-[15%]">{item["Receiver Name"]}</div>
                        <div className="table-data text-left w-[15%]">{item["Target Location"]}</div>
                        <div className="table-data text-left w-[15%]">{item["Quantity Delivered"]}</div>
                        <div className="table-data text-left w-[15%]">{item["Sent By"]}</div>
                        <div className="table-data text-center w-[5%]"><VerticalDot onClick={(event) => handleVerticalDotClick(event, item)} /></div>
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
                        onClick={() => handleUpdateStockDelivered()}
                    >
                        <span><Edit /></span> Edit
                    </button>
                    <button
                        className="dropdown-item"
                        onClick={() => alert(`Delete ${alertBox.data["Delivery Number"]}`)}
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

export default StockDelivered;
