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
import { getRequest, postRequest } from "../../services/ApiService";
import { useNavigate } from "react-router-dom";
import AddUser from '../../dialog/usermanagement-dialog/AddUser';
import EditUser from "../../dialog/usermanagement-dialog/EditUser";
import { getCookie } from "../../services/Cookies";

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
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [userData, setUserData] = useState([]);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });
    const [alertBox, setAlertBox] = useState({ visible: false, x: 0, y: 0, data: null });
    const [showEditMaterial, setShowEditMaterial] = useState(false);

    useEffect(() => {
        fetchuserDetails();
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


    const handleOpenAddUser = () => {
        if(showAddMaterial){
            fetchuserDetails();
            }
        setShowAddMaterial(prevState => !prevState);
    };

    const handleOpenEditUser = () => {
        if(showEditMaterial){
            fetchuserDetails();
        }
        setShowEditMaterial(prevState => !prevState);
    };


    const filteredData = userData.filter((item) =>
        item["userName"].toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteUser = (userId) => {
                    const url = `UserManagement/DeleteUser/${userId}`
                    postRequest(url)
                      .then((res) => {
                          if (res.status === 200) {
                            fetchuserDetails();
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

    const fetchuserDetails = () => {
                    const url = `UserManagement/GetUserList/${companyId}`
                    getRequest(url)
                        .then((res) => {
                            if (res.status === 200) {
                                setUserData(res.data);
                            }
                        })
                        .catch((error) => {
                            console.error("API Error:", error);
                        });
    }

    const handleInputChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
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
            setSelectedRows(paginatedData.map((item) => item["userCode"]));
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
        selectedRows.includes(item["userCode"])
    );

    const handleDownload = () => {
        const keysToKeep = ["userCode", "userName", "email", "userType", "accessLevel", "userStatus"];
        const cleanedData = filteredData.map(item =>
            Object.fromEntries(
                keysToKeep
                    .filter(key => key in item) // Ensure the key exists in the object
                    .map(key => [
                        key, 
                        key === "userStatus" ? (item[key] ? "Active" : "Inactive") : item[key] // Convert companyStatus
                    ])
            )
        );
        const dataToExport = selectedRows.length
            ? cleanedData.filter((item) => selectedRows.includes(item["userCode"]))
            : cleanedData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "User Management");
        XLSX.writeFile(workbook, "User_Management.xlsx");
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
        debugger
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        setSelectedUserData(item);
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
            {showAddMaterial && <AddUser value={showAddMaterial} handleOpenAddUser={handleOpenAddUser} />}
            {showEditMaterial && <EditUser value={showEditMaterial} selectedrow={alertBox.data} selectedUserData={selectedUserData} handleOpenEditUser={handleOpenEditUser} />}
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
                        <button className="outer-firstsection-add" onClick={handleOpenAddUser} disabled={getCookie("userType") === "Viewer"}>
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
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("userCode")}>
                            User ID
                            {sortConfig.key === "userCode" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("userName")}>
                            User Name
                            {sortConfig.key === "userName" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("email")}>
                            Email
                            {sortConfig.key === "email" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("userType")}>
                            User Type
                            {sortConfig.key === "userType" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("accessLevel")}>
                            Access Level
                            {sortConfig.key === "accessLevel" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("userStatus")}>
                            Status
                            {sortConfig.key === "userStatus" && (
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
                                    checked={selectedRows.includes(item["userCode"])}
                                    onChange={() => handleCheckboxChange(item["userCode"])}
                                />
                            </div>
                            {/* <div className="table-data text-hyper text-left w-[20%]" onClick={() => handleMaterialClick(item["userCode"])}>{item["userCode"]}</div> */}
                            <div className="table-data text-hyper text-left w-[20%]">{item["userCode"]}</div>
                            <div className="table-data text-left w-[25%]">{item["userName"]}</div>
                            <div className="table-data text-left w-[25%]">{item["email"]}</div>
                            <div className="table-data text-left w-[25%]">{item["userType"]}</div>
                            <div className="table-data text-left w-[25%]">{item["accessLevel"]}</div>
                            <div className="table-data text-left w-[20%]">
                                <span className={`${item["userStatus"] === true ? "status-available" : item["userStatus"] === false ? "status-not-available" : "status-reset"}`}>
                                    {item["userStatus"] === true ? "Active" : item["userStatus"] === false ? "Inactive" : "Need to reset password"}
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
                            onClick={() => handleDeleteUser(alertBox.data["userCode"])}
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

export default UserManagement;
