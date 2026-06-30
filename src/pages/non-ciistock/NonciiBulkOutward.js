import React, { useState, useEffect } from "react";
import { ReactComponent as TickButton } from "../../assets/svg/tickbutton.svg";
import { ReactComponent as CloseButton } from "../../assets/svg/closebutton.svg";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
import * as XLSX from "xlsx";
import { ReactComponent as UpArrow } from "../../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../../assets/svg/down-arrow.svg";
import { ReactComponent as VerticalDot } from "../../assets/svg/vertical-dot.svg";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import { ReactComponent as Edit } from "../../assets/svg/edit.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import FilterDateField from "../../utils/FilterDateField";
import CustomSelect from "../../utils/CustomSelect";
import AddStockInward from "../../dialog/nonciistock-dialog/AddStockInward";
import UpdateStockInward from "../../dialog/nonciistock-dialog/UpdateStockInward";
import NonCiiBulkOutwardDialog from "../../dialog/nonciistock-dialog/NonCiiBulkOutwardDialog";
import { getRequest, postRequest } from "../../services/ApiService";
import { getCookie } from "../../services/Cookies";
import { isLimitedUser } from '../../services/Cookies';
import { ToastError, ToastSuccess } from "../../services/ToastMsg";
import { useUser } from "../../UserContext";

const NonCiiBulkOutward = (props) => {
    const navigate = useNavigate();
    const breadcrumbData = [
        { label: "Non-CII Bulk Outward", path: "" },
    ];
    const { name } = useUser();
    const location = useLocation();
    const materialNumber = location.pathname.split('/').pop();
    const { materialDescription } = location.state || {};

    const handleMaterialClick = (deliveryNumber, matDescription, itemData) => {
        navigate(`/non-cii-stock/${materialNumber}/${deliveryNumber}`, { state: { itemData, materialDescription: matDescription } });
    };
    const [loading, setLoading] = useState(true);
    const [showUpdateStockInward, setshowUpdateStockInward] = useState(false);
    const [selectedMaterialData, setSelectedMaterialData] = useState("");
    const [materialData, setMaterilaData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [showStock, setShowStock] = useState(false);
    const [showBulkOutwardStock, setShowBulkOutwardStock] = useState(false);
    const [activeTab, setActiveTab] = useState("View all");
    const [alertBox, setAlertBox] = useState({ visible: false, x: 0, y: 0, data: null });
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });

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

    const filteredData = materialData.filter((item) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (item["materialNumber"] || "").toLowerCase().includes(query) ||
            (item["deliveryNumber"] || "").toLowerCase().includes(query) ||
            (item["orderNumber"] || "").toLowerCase().includes(query) ||
            (item["sourceLocation"] || "").toLowerCase().includes(query) ||
            (item["receivedBy"] || "").toLowerCase().includes(query) ||
            (item["rackLocation"] || "").toLowerCase().includes(query);

        if (activeTab === "New") {
            return matchesSearch && (item["status"] === "New" || !item["status"]);
        } else if (activeTab === "Used") {
            return matchesSearch && item["status"] === "Used";
        } else if (activeTab === "Transport") {
            return matchesSearch && item["status"] === "Transport";
        } else if (activeTab === "Damaged") {
            return matchesSearch && item["status"] === "Damaged";
        } else if (activeTab === "BreakFix") {
            return matchesSearch && item["status"] === "BreakFix";
        } else if (activeTab === "Outward") {
            return matchesSearch && item["status"] === "Outward";
        }

        return matchesSearch;
    });

    const isValidDate = (value) => {
        const date = new Date(value);
        return !isNaN(date);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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

    // Pinned selected rows from all data
    const pinnedSelectedRows = materialData.filter((item) =>
        selectedRows.some((row) => row.inboundStockNonCIIKey === item["inboundStockNonCIIKey"])
    );

    // Only unselected rows from current page
    const unselectedPageRows = paginatedData.filter(
        (item) => !selectedRows.some((row) => row.inboundStockNonCIIKey === item["inboundStockNonCIIKey"])
    );

    const handleInputChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(0);
    };

    const fetchMaterialDetails = () => {
        setLoading(true);
        const url = `SmInboundStockNonCiis/GetInwardNonStockCiis/all/${name}`;
        getRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    setMaterilaData(res.data);
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            })
            .finally(() => setLoading(false));
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
            const allRows = paginatedData.map((item) => ({
                inboundStockNonCIIKey: item.inboundStockNonCIIKey,
                deliveryNumber: item.deliveryNumber,
                orderNumber: item.orderNumber,
                materialNumber: item.materialNumber,
                materialDescription: item.materialDescription,
                deliveredQuantity: item.deliveredQuantity
            }));
            setSelectedRows((prev) => {
                const merged = [...prev];
                allRows.forEach((newRow) => {
                    if (!merged.some((r) => r.inboundStockNonCIIKey === newRow.inboundStockNonCIIKey)) {
                        merged.push(newRow);
                    }
                });
                return merged;
            });
        } else {
            const currentPageKeys = paginatedData.map((item) => item.inboundStockNonCIIKey);
            setSelectedRows((prev) =>
                prev.filter((row) => !currentPageKeys.includes(row.inboundStockNonCIIKey))
            );
        }
    };

    const handleCheckboxChange = (inboundStockNonCIIKey, deliveryNumber, orderNumber, materialNumber, materialDescription, deliveredQuantity) => {
        setSelectedRows((prev) => {
            const exists = prev.some((row) => row.inboundStockNonCIIKey === inboundStockNonCIIKey);
            if (exists) {
                return prev.filter((row) => row.inboundStockNonCIIKey !== inboundStockNonCIIKey);
            } else {
                return [
                    ...prev,
                    { inboundStockNonCIIKey, deliveryNumber, orderNumber, materialNumber, materialDescription, deliveredQuantity }
                ];
            }
        });
    };

    const isAllSelected =
        selectedRows.length > 0 &&
        paginatedData.every((item) =>
            selectedRows.some((row) => row.inboundStockNonCIIKey === item.inboundStockNonCIIKey)
        );

    const handleDownload = () => {
        const keysToKeep = ["deliveryNumber", "orderNumber", "inwardDate", "sourceLocation", "totalQuantity", "deliveredQuantity", "receivedBy", "rackLocation", "status"];
        
        const dataToExport = selectedRows.length
            ? filteredData.filter((item) => selectedRows.some((row) => row.inboundStockNonCIIKey === item["inboundStockNonCIIKey"]))
            : filteredData;

        const cleanedData = dataToExport.map(item =>
            Object.fromEntries(
                keysToKeep
                    .filter(key => key in item)
                    .map(key => [key, item[key]])
            )
        );
        const worksheet = XLSX.utils.json_to_sheet(cleanedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Non CII Bulk Outward Details");
        XLSX.writeFile(workbook, "Non_CII_Bulk_Outward_Details.xlsx");
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleOpenAddStock = () => {
        if (showStock) {
            fetchMaterialDetails();
        }
        setShowStock(prevState => !prevState);
    };

    const handleOpenBulkOutward = () => {
        if (showBulkOutwardStock) {
            fetchMaterialDetails();
            setSelectedRows([]);
        }
        setShowBulkOutwardStock(prevState => !prevState);
    };

    const handleRemoveMaterial = (deliveryNumber, inboundStockNonCIIKey) => {
        const url = `SmInboundStockNonCiis/DeleteNonStockInbounddata/${materialNumber}/${deliveryNumber}/${inboundStockNonCIIKey}/${name}`
        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Deleted Successfully");
                    fetchMaterialDetails();
                }
            })
            .catch((error) => {
                ToastError(error.response.data);
            });
    };

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

    const handleUpdateStockInward = () => {
        if (showUpdateStockInward) {
            fetchMaterialDetails();
        }
        setshowUpdateStockInward(prevState => !prevState);
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    };

    const renderRow = (item, index, isPinned = false) => (
        <div
            key={`${isPinned ? "pinned" : "row"}-${item["inboundStockNonCIIKey"] || item["deliveryNumber"]}-${index}`}
            className={`div-data ${isPinned ? "bg-blue-50 border-l-2 border-blue-400" : ""}`}
        >
            <div className="text-center w-[5%]">
                <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedRows.some((row) => row.inboundStockNonCIIKey === item["inboundStockNonCIIKey"])}
                    onChange={() =>
                        handleCheckboxChange(
                            item["inboundStockNonCIIKey"],
                            item["deliveryNumber"],
                            item["orderNumber"],
                            item["materialNumber"],
                            item["materialDescription"],
                            item["deliveredQuantity"]
                        )
                    }
                />
            </div>
            <div 
                className="table-data text-left w-[15%]" 
                // onClick={() => handleMaterialClick(item["deliveryNumber"], item["materialDescription"], item)}
            >
                {item["materialNumber"]}
            </div>
            <div 
                className="table-data text-left w-[15%] cursor-pointer" 
            >
                {item["deliveryNumber"]}
            </div>
            <div className="table-data text-left w-[15%]">{item["orderNumber"]}</div>
            <div className="table-data text-left w-[12%]">{formatDate(item["inwardDate"])}</div>
            <div className="table-data text-left w-[13%]">{item["sourceLocation"]}</div>
            <div className="table-data text-left w-[10%]">{item["totalQuantity"]}</div>
            <div className="table-data text-left w-[10%]">{item["deliveredQuantity"]}</div>
            <div className="table-data text-left w-[10%]">{item["receivedBy"]}</div>
            <div className="table-data text-left w-[13%]">{item["rackLocation"]}</div>
            {/* <div className="table-data text-left w-[10%]">
                <span className={`${item["status"] === "New" ? "status-available" : item["status"] === "Damaged" ? "status-not-available" : "status-unknown"}`}>{item["status"] || "New"}</span>
            </div> */}
            <div className="table-data text-center w-[15%]">
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
    );

    return (
        <div>
            {loading && (
                <div className="loader-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            {showStock && <AddStockInward value={showStock} materialNumber={materialNumber} materialDescription={materialDescription} handleOpenAddStock={handleOpenAddStock} />}
            {showUpdateStockInward && <UpdateStockInward value={showUpdateStockInward} materialNumber={materialNumber} materialDescription={materialDescription} selectedMaterialData={selectedMaterialData} selectedRow={alertBox.data} handleUpdateStockInward={handleUpdateStockInward} />}
            {showBulkOutwardStock && <NonCiiBulkOutwardDialog value={showBulkOutwardStock} selectedData={selectedRows} handleOpenBulkOutward={handleOpenBulkOutward} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <div className="outer-secondsection">
                    <div className="tabs">
                        <button
                            className={`tab-button ${activeTab === "View all" ? "active" : ""}`}
                            onClick={() => setActiveTab("View all")}
                        >
                            View all
                        </button>
                        <button
                            className={`tab-button ${activeTab === "New" ? "active" : ""}`}
                            onClick={() => setActiveTab("New")}
                        >
                            New
                        </button>
                        <button
                            className={`tab-button ${activeTab === "Used" ? "active" : ""}`}
                            onClick={() => setActiveTab("Used")}
                        >
                            Used
                        </button>
                        <button
                            className={`tab-button ${activeTab === "Transport" ? "active" : ""}`}
                            onClick={() => setActiveTab("Transport")}
                        >
                            Transport
                        </button>
                        <button
                            className={`tab-button ${activeTab === "Damaged" ? "active" : ""}`}
                            onClick={() => setActiveTab("Damaged")}
                        >
                            Damaged
                        </button>
                        <button
                            className={`tab-button ${activeTab === "BreakFix" ? "active" : ""}`}
                            onClick={() => setActiveTab("BreakFix")}
                        >
                            BreakFix
                        </button>
                        <button
                            className={`tab-button ${activeTab === "Outward" ? "active" : ""}`}
                            onClick={() => setActiveTab("Outward")}
                        >
                            Outward
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
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("deliveryNumber")}>
                            Delivery Number
                            {sortConfig.key === "deliveryNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("orderNumber")}>
                            Order Number
                            {sortConfig.key === "orderNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[12%]" onClick={() => handleSort("inwardDate")}>
                            Inward Date
                            {sortConfig.key === "inwardDate" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[13%]" onClick={() => handleSort("sourceLocation")}>
                            Inward From
                            {sortConfig.key === "sourceLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("totalQuantity")}>
                            Quantity Received
                            {sortConfig.key === "totalQuantity" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("deliveredQuantity")}>
                            Current Stock
                            {sortConfig.key === "deliveredQuantity" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("receivedBy")}>
                            Received By
                            {sortConfig.key === "receivedBy" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[13%]" onClick={() => handleSort("rackLocation")}>
                            Racks Location
                            {sortConfig.key === "rackLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        {/* <div className="table-header text-left w-[10%]" onClick={() => handleSort("status")}>
                            Status
                            {sortConfig.key === "status" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div> */}
                        <div className="table-header text-left w-[15%]">
                            <button
                                className={`outer-firstsection-add ${selectedRows.length === 0
                                    ? "cursor-not-allowed opacity-40"
                                    : "cursor-pointer"
                                    }`}
                                onClick={selectedRows.length > 0 ? handleOpenBulkOutward : undefined}
                                disabled={selectedRows.length === 0 || isLimitedUser()}
                            >
                                Bulk Outward
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {/* Pinned selected rows */}
                        {pinnedSelectedRows.length > 0 && (
                            <>
                                {pinnedSelectedRows.map((item, index) =>
                                    renderRow(item, index, true)
                                )}
                                {unselectedPageRows.length > 0 && (
                                    <div className="border-t-2 border-blue-200 my-1" />
                                )}
                            </>
                        )}

                        {/* Unselected rows from current page */}
                        {unselectedPageRows.map((item, index) =>
                            renderRow(item, index, false)
                        )}
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
                            onClick={handleUpdateStockInward}
                        >
                            <span><Edit /></span> Edit
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => handleRemoveMaterial(alertBox.data["deliveryNumber"], alertBox.data["inboundStockNonCIIKey"])}
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

export default NonCiiBulkOutward;
