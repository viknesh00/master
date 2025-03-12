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
import { getRequest, postRequest } from "../../services/ApiService";
import AddWarehouse from '../../dialog/usermanagement-dialog/AddWarehouse';
import EditWarehouse from "../../dialog/usermanagement-dialog/EditWarehouse";
import { getCookie } from "../../services/Cookies";

const WarehouseManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const companyId = location.pathname.split('/').pop();
    const { companyName } = location.state || {};
    const breadcrumbData = [
        { label: "Company Management", path: "/company-management" },
        { label: `${companyName}`, path: "" },
    ];
    const [currentPage, setCurrentPage] = useState(1);
    const [warehouseData, setWarehouseData] = useState([]);
    const [selectedWarehouseData, setSelectedWarehouseData] = useState([]);
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
        fetchWarehouseDetails();
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

        const fetchWarehouseDetails = () => {
                const url = `UserManagement/GetTenetList/${companyId}`
                getRequest(url)
                    .then((res) => {
                        if (res.status === 200) {
                            setWarehouseData(res.data);
                        }
                    })
                    .catch((error) => {
                        console.error("API Error:", error);
                    });
        }

    const handleOpenAddWarehouse = () => {
        if(showAddMaterial){
            fetchWarehouseDetails();
            }
        setShowAddMaterial(prevState => !prevState);
    };

    const handleOpenEditWarehouse = () => {
        if(showEditMaterial){
            fetchWarehouseDetails();
            }
        setShowEditMaterial(prevState => !prevState);
    };


    const filteredData = warehouseData.filter((item) =>
        item["tenentName"]?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteWarehouse = (companyId,tenentId) => {
                const url = `UserManagement/DeleteTenet/${companyId}/${tenentId}`
                postRequest(url)
                  .then((res) => {
                      if (res.status === 200) {
                        fetchWarehouseDetails();
                      }
                  })
                  .catch((error) => {
                      console.error("API Error:", error);
                  });
    }

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
            setSelectedRows(paginatedData.map((item) => item["tenentCode"]));
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
        selectedRows.includes(item["tenentCode"])
    );

    const handleDownload = () => {
        const dataToExport = selectedRows.length
            ? filteredData.filter((item) => selectedRows.includes(item["tenentCode"]))
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

    const handleMaterialClick = (WarehouseID, WarehouseName) => {
        navigate(`/company-management/${companyId}/${WarehouseID}`, { state: { companyName, WarehouseName } });
    };

    const handleVerticalDotClick = (event, item) => {
        debugger
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        setSelectedWarehouseData(item);
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
            {showAddMaterial && <AddWarehouse value={showAddMaterial} handleOpenAddWarehouse={handleOpenAddWarehouse} />}
            {showEditMaterial && <EditWarehouse value={showEditMaterial} selectedrow={alertBox.data} selectedWarehouseData={selectedWarehouseData} handleOpenEditWarehouse={handleOpenEditWarehouse} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <span className="main-title">{companyName}</span>

                <div className="outer-firstsection">
                    <div className="outer-firstsection-header">
                        <span className="outer-firstsection-title">{companyName}</span>
                        <span className="outer-firstsection-subtitle">
                            {filteredData.length} Warehouse
                        </span>
                    </div>
                    <div className="outer-firstsection-actions">
                        <button className="outer-firstsection-download" onClick={handleDownload}>
                            <Download /> Download
                        </button>
                        <button className="outer-firstsection-add" onClick={handleOpenAddWarehouse} disabled={getCookie("userType") === "Viewer"}>
                            <Plus /> Add Warehouse
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
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("tenentCode")}>
                            Warehouse ID
                            {sortConfig.key === "tenentCode" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("tenentName")}>
                            Warehouse Name
                            {sortConfig.key === "tenentName" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("tenentLocation")}>
                            Location
                            {sortConfig.key === "tenentLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("tenentStatus")}>
                            Status
                            {sortConfig.key === "tenentStatus" && (
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
                                    checked={selectedRows.includes(item["tenentCode"])}
                                    onChange={() => handleCheckboxChange(item["tenentCode"])}
                                />
                            </div>
                            <div className="table-data text-hyper text-left w-[20%]" onClick={() => handleMaterialClick(item["tenentCode"], item["tenentName"])}>{item["tenentCode"]}</div>
                            <div className="table-data text-left w-[25%]">{item["tenentName"]}</div>
                            <div className="table-data text-left w-[25%]">{item["tenentLocation"]}</div>
                            <div className="table-data text-left w-[20%]">
                                <span className={`${item["tenentStatus"] === true ? "status-available" : "status-not-available"}`}>
                                    {item["tenentStatus"] === true ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="table-data text-center w-[5%]">
                                <VerticalDot
                                    className={getCookie("userType") === "Viewer" ? "cursor-not-allowed" : "cursor-pointer"}
                                    onClick={(event) => {
                                        if (getCookie("userType") !== "Viewer") {
                                            handleVerticalDotClick(event, item);
                                        }
                                    }}

                                />
                            </div>
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
                            onClick={() => handleDeleteWarehouse(alertBox.data["companyCode"],alertBox.data["tenentCode"])}
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

export default WarehouseManagement;
