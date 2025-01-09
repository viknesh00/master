import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import Ciistock_data from "../../data/ciistock_data.json";
import * as XLSX from "xlsx";
import { ReactComponent as UpArrow } from "../../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../../assets/svg/down-arrow.svg";
import { ReactComponent as VerticalDot } from "../../assets/svg/vertical-dot.svg";
import { ReactComponent as Edit } from "../../assets/svg/edit.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { useNavigate } from "react-router-dom";
import Addnonciistock from '../../dialog/ciistock-dialog/Addnonciistock'
import EditMaterial from "../../dialog/ciistock-dialog/EditMaterial";

const Nonciistock = () => {
    const navigate = useNavigate();
    const breadcrumbData = [
        { label: "Non-CII Stock", path: "" },
    ];
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });
    const [alertBox, setAlertBox] = useState({ visible: false, x: 0, y: 0, data: null });
    const [showEditMaterial, setShowEditMaterial] = useState(false);

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


    const handleOpenAddMaterial = () => {
        setShowAddMaterial(prevState => !prevState);
    };

    const handleOpenEditMaterial = () => {
        setShowEditMaterial(prevState => !prevState);
    };


    const filteredData = Ciistock_data.filter((item) =>
        item["materialDescription"].toLowerCase().includes(searchQuery.toLowerCase())
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
            setSelectedRows(paginatedData.map((item) => item["materialNumber"]));
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
        selectedRows.includes(item["materialNumber"])
    );

    const handleDownload = () => {
        const dataToExport = selectedRows.length
            ? filteredData.filter((item) => selectedRows.includes(item["materialNumber"]))
            : filteredData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Non-CII Stock");
        XLSX.writeFile(workbook, "Non-CII_Stock.xlsx");
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleMaterialClick = (materialNumber) => {
        navigate(`/non-cii-stock/${materialNumber}`);
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


    return (
        <div>
            {showAddMaterial && <Addnonciistock value={showAddMaterial} handleOpenAddMaterial={handleOpenAddMaterial} />}
            {showEditMaterial && <EditMaterial value={showEditMaterial} handleOpenEditMaterial={handleOpenEditMaterial} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <span className="main-title">Non-CII Stock</span>

                <div className="outer-firstsection">
                    <div className="outer-firstsection-header">
                        <span className="outer-firstsection-title">Non-CII Stock</span>
                        <span className="outer-firstsection-subtitle">
                            {filteredData.length} Materials
                        </span>
                    </div>
                    <div className="outer-firstsection-actions">
                        <button className="outer-firstsection-download" onClick={handleDownload}>
                            <Download /> Download
                        </button>
                        <button className="outer-firstsection-add" onClick={handleOpenAddMaterial}>
                            <Plus /> Add Material
                        </button>
                    </div>
                </div>
                <div className="outer-secondsection">
                    <div className="tabs">
                        <button className="tab-button active">View all</button>
                        <button className="tab-button">Available</button>
                        <button className="tab-button">Not Available</button>
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
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("materialNumber")}>
                            Material Number
                            {sortConfig.key === "materialNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("materialDescription")}>
                            materialDescription
                            {sortConfig.key === "materialDescription" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("Stock in Hand")}>
                            Stock In Hand
                            {sortConfig.key === "Stock in Hand" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("New Stock")}>
                            New Stock
                            {sortConfig.key === "New Stock" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("Used Stock")}>
                            Used Stock
                            {sortConfig.key === "Used Stock" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("Status")}>
                            Status
                            {sortConfig.key === "Status" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]"></div>
                    </div>

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
                            <div className="table-data text-hyper text-left w-[15%]" onClick={() => handleMaterialClick(item["materialNumber"])}>{item["materialNumber"]}</div>
                            <div className="table-data text-left w-[25%]">{item["materialDescription"]}</div>
                            <div className="table-data text-left w-[15%]">{item["Stock in Hand"]}</div>
                            <div className="table-data text-left w-[10%]">{item["New Stock"]}</div>
                            <div className="table-data text-left w-[10%]">{item["Used Stock"]}</div>
                            <div className="table-data text-left w-[10%]">
                                <span className={`${item["Status"] === "Available" ? "status-available" : item["Status"] === "Not Available" ? "status-not-available" : "status-unknown"}`}>{item["Status"]}</span>
                            </div>
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
                            onClick={() => setShowEditMaterial(true)}
                        >
                            <span><Edit /></span> Edit
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => alert(`Delete ${alertBox.data["materialNumber"]}`)}
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
        </div>
    );
};

export default Nonciistock;
