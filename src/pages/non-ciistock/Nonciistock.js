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
import { getRequest, postRequest } from "../../services/ApiService";
import { getCookie } from "../../services/Cookies";
import { useUser } from "../../UserContext";

const Nonciistock = () => {
    const { name } = useUser();
    const navigate = useNavigate();
    const breadcrumbData = [
        { label: "Non-CII Stock", path: "" },
    ];
    const [nonciiStockData, setNonCiiStockData] = useState([]);
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
     const [activeTab, setActiveTab] = useState("View all");

    useEffect(() => {
        fetchnonciistockdata();
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

        const fetchnonciistockdata = () => {
            const url = `SmInboundStockNonCiis/GetSmInboundNonStockCiis/${name}`;
            
            getRequest(url)
              .then((res) => {
                  if (res.status === 200) {
                    const updatedData = res.data.map(item => {
                        const newStock = item.newstock || 0;
                        const usedStock = item.usedstock || 0;
                        const stockinHand = newStock + usedStock;
                        const status = stockinHand > 0 ? 'Available' : 'Not Available';
                        return { ...item, stockinHand, status };
                      });
                      setNonCiiStockData(updatedData)
                  }
              })
              .catch((error) => {
                  console.error("API Error:", error);
              });
        };


    const handleOpenAddMaterial = () => {
        if(showAddMaterial){
            fetchnonciistockdata();
        }
        setShowAddMaterial(prevState => !prevState);
    };

    const handleOpenEditMaterial = () => {
        if(showEditMaterial){
            fetchnonciistockdata();
        }
        setShowEditMaterial(prevState => !prevState);
    };


    const filteredData = nonciiStockData.filter((item) => {
        const query = searchQuery.toLowerCase();

        const matchesSearch = Object.values(item).some((value) =>
            String(value).toLowerCase().includes(query)
        );

        if (activeTab === "Available") {
            return matchesSearch && item["status"] === "Available";
        } else if (activeTab === "Not Available") {
            return matchesSearch && item["status"] === "Not Available";
        }

        return matchesSearch;
    });

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

    const handleMaterialClick = (materialNumber, materialDescription) => {
        debugger
        navigate(`/non-cii-stock/${materialNumber}`, { state: { materialDescription } });
    };

    const handleRemoveMaterial = (value) => {
            const url = `SmInboundStockCiis/${value}/${false}`
            postRequest(url)
              .then((res) => {
                  if (res.status === 200) {
                    alert("Deleted Successfuly");
                    fetchnonciistockdata();
                  }
              })
              .catch((error) => {
                  console.error("API Error:", error);
              });
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


    return (
        <div>
            {showAddMaterial && <Addnonciistock value={showAddMaterial} handleOpenAddMaterial={handleOpenAddMaterial} />}
            {showEditMaterial && <EditMaterial value={showEditMaterial} selectedrow={alertBox.data} handleOpenEditMaterial={handleOpenEditMaterial} />}
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
                        <button className="outer-firstsection-add" onClick={handleOpenAddMaterial} disabled={getCookie("userType") === "Viewer"}>
                            <Plus /> Add Material
                        </button>
                    </div>
                </div>
                <div className="outer-secondsection">
                <div className="tabs">
                        <button
                            className={`tab-button ${activeTab === "View all" ? "active" : ""}`}
                            onClick={() => setActiveTab("View all")}
                        >
                            View all
                        </button>
                        <button
                            className={`tab-button ${activeTab === "Available" ? "active" : ""}`}
                            onClick={() => setActiveTab("Available")}
                        >
                            Available
                        </button>
                        <button
                            className={`tab-button ${activeTab === "Not Available" ? "active" : ""}`}
                            onClick={() => setActiveTab("Not Available")}
                        >
                            Not Available
                        </button>
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
                            Material Description
                            {sortConfig.key === "materialDescription" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("stockinHand")}>
                            Stock In Hand
                            {sortConfig.key === "Stock in Hand" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("newstock")}>
                            New Stock
                            {sortConfig.key === "New Stock" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("usedstock")}>
                            Used Stock
                            {sortConfig.key === "Used Stock" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("status")}>
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
                            <div className="table-data text-hyper text-left w-[15%]" onClick={() => handleMaterialClick(item["materialNumber"], item["materialDescription"])}>{item["materialNumber"]}</div>
                            <div className="table-data text-left w-[25%]">{item["materialDescription"]}</div>
                            <div className="table-data text-left w-[15%]">{item["stockinHand"]}</div>
                            <div className="table-data text-left w-[10%]">{item["newstock"]}</div>
                            <div className="table-data text-left w-[10%]">{item["usedstock"]}</div>
                            <div className="table-data text-left w-[10%]">
                                <span className={`${item["status"] === "Available" ? "status-available" : item["status"] === "Not Available" ? "status-not-available" : "status-unknown"}`}>{item["status"]}</span>
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
                            onClick={() => handleRemoveMaterial(alertBox.data["materialNumber"])}
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
