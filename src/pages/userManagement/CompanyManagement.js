import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
import Company_data from "../../data/company_data.json";
import * as XLSX from "xlsx";
import { ReactComponent as UpArrow } from "../../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../../assets/svg/down-arrow.svg";
import { ReactComponent as VerticalDot } from "../../assets/svg/vertical-dot.svg";
import { ReactComponent as Edit } from "../../assets/svg/edit.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { useNavigate } from "react-router-dom";
import { getRequest, postRequest } from "../../services/ApiService";
import AddCompany from '../../dialog/usermanagement-dialog/AddCompany';
import EditCompany from "../../dialog/usermanagement-dialog/EditCompany";
import { getCookie } from "../../services/Cookies";
import { useUser } from "../../UserContext";

const CompanyManagement = () => {
    const { name } = useUser();
    const navigate = useNavigate();
    const breadcrumbData = [
        { label: "Company Management", path: "" },
    ];
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [companyData, setCompanyData] = useState([]);
    const [selectedcompanyData, setSelectedCompanyData] = useState([]);
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
        fetchCompanyDetails();
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

    const fetchCompanyDetails = () => {
            const url = `UserManagement/GetCompanyList/${name}`
            getRequest(url)
                .then((res) => {
                    if (res.status === 200) {
                        setCompanyData(res.data);
                    }
                })
                .catch((error) => {
                    console.error("API Error:", error);
                });
    }

    const handleDeleteCompany = (companyId) => {
            const url = `UserManagement/DeleteCompanyUserManagement/${companyId}`
            postRequest(url)
              .then((res) => {
                  if (res.status === 200) {
                    fetchCompanyDetails();
                  }
              })
              .catch((error) => {
                  console.error("API Error:", error);
              });
    }

    const handleOpenAddCompany = () => {
        if(showAddMaterial){
        fetchCompanyDetails();
        }
        setShowAddMaterial(prevState => !prevState);
    };

    const handleOpenEditCompany = () => {
        if(showEditMaterial){
        fetchCompanyDetails();
        }
        setShowEditMaterial(prevState => !prevState);
    };


    const filteredData = companyData.filter((item) =>
        item["companyName"].toLowerCase().includes(searchQuery.toLowerCase())
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

    const paginatedData = sortedData.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
    );

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
            setSelectedRows(paginatedData.map((item) => item["pk_CompanyCode"]));
        } else {
            setSelectedRows([]);
        }
    };

    const handleCheckboxChange = (companyId) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(companyId)
                ? prevSelectedRows.filter((item) => item !== companyId)
                : [...prevSelectedRows, companyId]
        );
    };

    const isAllSelected = selectedRows.length > 0 && paginatedData.every((item) =>
        selectedRows.includes(item["pk_CompanyCode"])
    );

    const handleDownload = () => {
        const dataToExport = selectedRows.length
            ? filteredData.filter((item) => selectedRows.includes(item["pk_CompanyCode"]))
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

    const handleMaterialClick = (companyId, companyName) => {
        navigate(`/company-management/${companyId}`, { state: { companyName } });
    };

    const handleVerticalDotClick = (event, item) => {
        debugger
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        setSelectedCompanyData(item);
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
            {showAddMaterial && <AddCompany value={showAddMaterial} handleOpenAddCompany={handleOpenAddCompany} />}
            {showEditMaterial && <EditCompany value={showEditMaterial} selectedrow={alertBox.data} selectedcompanyData={selectedcompanyData} handleOpenEditCompany={handleOpenEditCompany} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <span className="main-title">Company Management</span>

                <div className="outer-firstsection">
                    <div className="outer-firstsection-header">
                        <span className="outer-firstsection-title">Company Management</span>
                        <span className="outer-firstsection-subtitle">
                            {filteredData.length} Companies
                        </span>
                    </div>
                    <div className="outer-firstsection-actions">
                        <button className="outer-firstsection-download" onClick={handleDownload}>
                            <Download /> Download
                        </button>
                        <button className="outer-firstsection-add" onClick={handleOpenAddCompany} disabled={getCookie("userType") === "Viewer"}>
                            <Plus /> Add Company
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
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("pk_CompanyCode")}>
                            Company ID
                            {sortConfig.key === "pk_CompanyCode" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("companyName")}>
                            Company Name
                            {sortConfig.key === "companyName" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("domainName")}>
                            Company Domain
                            {sortConfig.key === "domainName" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("companyStatus")}>
                            Status
                            {sortConfig.key === "companyStatus" && (
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
                                    checked={selectedRows.includes(item["pk_CompanyCode"])}
                                    onChange={() => handleCheckboxChange(item["pk_CompanyCode"])}
                                />
                            </div>
                            <div
                                className={`table-data text-hyper text-left w-[20%] ${item["companyStatus"] === false ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                onClick={() => item["companyStatus"] !== false && handleMaterialClick(item["pk_CompanyCode"], item["companyName"])}
                            >
                                {item["pk_CompanyCode"]}
                            </div>
                            <div className="table-data text-left w-[25%]">{item["companyName"]}</div>
                            <div className="table-data text-left w-[25%]">{item["domainName"]}</div>
                            <div className="table-data text-left w-[20%]">
                                <span className={`${item["companyStatus"] === true ? "status-available" : "status-not-available"}`}>
                                    {item["companyStatus"] === true ? "Active" : "Inactive"}
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
                            onClick={()=> handleDeleteCompany(alertBox.data["pk_CompanyCode"])}
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

export default CompanyManagement;
