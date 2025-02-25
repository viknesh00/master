import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import Warehouse_data from "../../data/warehouse_data.json";
import * as XLSX from "xlsx";
import { ReactComponent as UpArrow } from "../../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../../assets/svg/down-arrow.svg";
import { ReactComponent as VerticalDot } from "../../assets/svg/vertical-dot.svg";
import { ReactComponent as Edit } from "../../assets/svg/edit.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { useNavigate } from "react-router-dom";
import AddUser from '../../dialog/usermanagement-dialog/AddUser';
import EditUser from "../../dialog/usermanagement-dialog/EditUser";

const UserManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const companyId = location.pathname.split('/').pop();
    const { companyName } = location.state || {};
    const { WarehouseName } = location.state || {};
    const breadcrumbData = [
        { label: "Company Management", path: "/company-management" },
        { label: `${companyName}`, path: `/company-management/${companyId}`, state:{companyName} },
        { label: `${WarehouseName}`, path: "" },
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


    const filteredData = Warehouse_data.filter((item) =>
        item["WarehouseName"].toLowerCase().includes(searchQuery.toLowerCase())
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
            setSelectedRows(paginatedData.map((item) => item["WarehouseID"]));
        } else {
            setSelectedRows([]);
        }
    };

    const handleCheckboxChange = (WarehouseID) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(WarehouseID)
                ? prevSelectedRows.filter((item) => item !== WarehouseID)
                : [...prevSelectedRows, WarehouseID]
        );
    };

    const isAllSelected = selectedRows.length > 0 && paginatedData.every((item) =>
        selectedRows.includes(item["WarehouseID"])
    );

    const handleDownload = () => {
        const dataToExport = selectedRows.length
            ? filteredData.filter((item) => selectedRows.includes(item["WarehouseID"]))
            : filteredData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Company Management");
        XLSX.writeFile(workbook, "Company_Management.xlsx");
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleMaterialClick = (WarehouseID) => {
        navigate(`/company-management/${WarehouseID}`);
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
            {showAddMaterial && <AddUser value={showAddMaterial} handleOpenAddMaterial={handleOpenAddMaterial} />}
            {showEditMaterial && <EditUser value={showEditMaterial} handleOpenEditMaterial={handleOpenEditMaterial} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <span className="main-title">{WarehouseName}</span>

                <div className="outer-firstsection">
                    <div className="outer-firstsection-header">
                        <span className="outer-firstsection-title">{WarehouseName}</span>
                        <span className="outer-firstsection-subtitle">
                            {filteredData.length} User
                        </span>
                    </div>
                    <div className="outer-firstsection-actions">
                        <button className="outer-firstsection-download" onClick={handleDownload}>
                            <Download /> Download
                        </button>
                        <button className="outer-firstsection-add" onClick={handleOpenAddMaterial}>
                            <Plus /> Add User
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
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("WarehouseID")}>
                            User ID
                            {sortConfig.key === "WarehouseID" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("WarehouseName")}>
                            User Name
                            {sortConfig.key === "WarehouseName" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("Location")}>
                            Email
                            {sortConfig.key === "Location" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("Location")}>
                            User Type
                            {sortConfig.key === "Location" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("Location")}>
                            Access Level
                            {sortConfig.key === "Location" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("Status")}>
                            Status
                            {sortConfig.key === "Status" && (
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
                                    checked={selectedRows.includes(item["WarehouseID"])}
                                    onChange={() => handleCheckboxChange(item["WarehouseID"])}
                                />
                            </div>
                            <div className="table-data text-hyper text-left w-[20%]" onClick={() => handleMaterialClick(item["WarehouseID"])}>{item["WarehouseID"]}</div>
                            <div className="table-data text-left w-[25%]">{item["WarehouseName"]}</div>
                            <div className="table-data text-left w-[25%]">{item["WarehouseName"]}</div>
                            <div className="table-data text-left w-[25%]">{item["WarehouseName"]}</div>
                            <div className="table-data text-left w-[25%]">{item["Location"]}</div>
                            <div className="table-data text-left w-[20%]">
                                <span className={`${item["Status"] === "Available" ? "status-available" : item["Status"] === "Not Available" ? "status-not-available" : "status-unknown"}`}>{item["Status"]}</span>
                            </div>
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
                            onClick={() => setShowEditMaterial(true)}
                        >
                            <span><Edit /></span> Edit
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => alert(`Delete ${alertBox.data["WarehouseID"]}`)}
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

export default UserManagement;
