import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
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
import { isLimitedUser } from '../../services/Cookies';

const WarehouseManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const companyId = location.pathname.split('/').pop();
    const { companyName } = location.state || {};
    const breadcrumbData = [
        { label: "Company Management", path: "/company-management" },
        { label: `${companyName}`, path: "" },
    ];
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [warehouseData, setWarehouseData] = useState([]);
    const [selectedWarehouseData, setSelectedWarehouseData] = useState([]);
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
        const keysToKeep = ["tenentCode", "tenentName", "tenentLocation", "tenentStatus"];
        const cleanedData = filteredData.map(item =>
            Object.fromEntries(
                keysToKeep
                    .filter(key => key in item) // Ensure the key exists in the object
                    .map(key => [
                        key, 
                        key === "tenentStatus" ? (item[key] ? "Active" : "Inactive") : item[key] // Convert companyStatus
                    ])
            )
        );
        const dataToExport = selectedRows.length
            ? cleanedData.filter((item) => selectedRows.includes(item["tenentCode"]))
            : cleanedData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouse Management");
        XLSX.writeFile(workbook, "Warhouse_Management.xlsx");
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
                        <button className="outer-firstsection-add" onClick={handleOpenAddWarehouse} disabled={isLimitedUser()}>
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

export default WarehouseManagement;
