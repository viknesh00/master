import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import StockCard from "../../utils/Stockcard";
import { ReactComponent as MinusSquare } from "../../assets/svg/minus-square.svg";
import { ReactComponent as PlusSquare } from "../../assets/svg/plus-square.svg";
import { ReactComponent as TickButton } from "../../assets/svg/tickbutton.svg";
import { ReactComponent as CloseButton } from "../../assets/svg/closebutton.svg";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
import * as XLSX from "xlsx";
import { ReactComponent as UpArrow } from "../../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../../assets/svg/down-arrow.svg";
import { ReactComponent as VerticalDot } from "../../assets/svg/vertical-dot.svg";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import { ReactComponent as FlipForward } from "../../assets/svg/flip-forward.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { useNavigate } from "react-router-dom";
import Material_data from "../../data/material_data.json";
import FilterDateField from "../../utils/FilterDateField";
import CustomSelect from "../../utils/CustomSelect";
import AddStock from "../../dialog/ciistock-dialog/AddStock";
import MovedAlert from "../../dialog/MovedAlert";
import { getRequest, postRequest } from "../../services/ApiService";
import { getCookie } from "../../services/Cookies";
import { isLimitedUser } from '../../services/Cookies';
import { ToastSuccess } from "../../services/ToastMsg";
import { ToastError } from "../../services/ToastMsg";
import { useUser } from "../../UserContext";
import CiiBulkOutwardDialog from "../../dialog/ciistock-dialog/CiiBulkOutwardDialog";

const CiiBulkOutward = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { name, fullName } = useUser();
    const materialNumber = location.pathname.split('/').pop();
    const { materialDescription, serialNumber } = location.state || {};
    const [isPanelVisible, setPanelVisible] = useState(true);
    const [showMovetoused, setShowMovedtoused] = useState(false);
    const breadcrumbData = [
        { label: "CII Bulk Outward", path: "" }
    ];
    const [materialData, setMaterilaData] = useState([]);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedSerialNumber, setSelectedSerialNumber] = useState("");
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
    const [filterValue, setFilterValue] = useState({});
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [inwardFrom, setInwardFrom] = useState("")
    const [resetSelect, setResetSelect] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchMaterialDetails();
        //fetchMaterialAnalysiticsCiiData();

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

    const formatDate = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const fetchMaterialAnalysiticsCiiData = () => {
        setLoading(true);
        const url = `SmInboundStockNonCiis/AnalyticsCII/${materialNumber}`
        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    setLoading(false);
                    setAnalyticsData(res.data);
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }

    const fetchMaterialDetails = () => {
        setLoading(true);

        const url = `SmInboundStockCiis/${"All"}/${null}/${name}`
        getRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    setLoading(false);
                    res.data.forEach((item) => {
                        if (item.inwardDate) item.inwardDate = item.inwardDate;
                        if (item.createdDate) item.createdDate = formatDate(item.createdDate);
                        if (item.updatedDate) item.updatedDate = formatDate(item.updatedDate);
                    });
                    setMaterilaData(res.data);
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }

    const handledeleteSerialumber = () => {
        const url = `SmInboundStockCiis/serialNumberHardDelete/${materialNumber}/${selectedSerialNumber}`
        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Serial Number Deleted Successfully");
                    fetchMaterialDetails();
                    //fetchMaterialAnalysiticsCiiData();
                    setAlertBox({ visible: false, x: 0, y: 0, data: null });
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
                ToastError(error.response.data);
            });
    }

    const filteredData = materialData.filter((item) => {
        const query = searchQuery.toLowerCase();
        const serial = item["serialNumber"]?.toString().toLowerCase().includes(query);
        //const serial = item["serialNumber"] || "";

        const matchesSearch =
            serial ||
            Object.values(item).some((value) =>
                String(value).toLowerCase().includes(query)
            );

        if (activeTab === "New") {
            return matchesSearch && item["status"] === "New";
        } else if (activeTab === "Used") {
            return matchesSearch && item["status"] === "Used";
        } else if (activeTab === "Damaged") {
            return matchesSearch && item["status"] === "Damaged";
        } else if (activeTab === "BreakFix") {
            return matchesSearch && item["status"] === "BreakFix";
        }
        else if (activeTab === "Outward") {
            return matchesSearch && item["status"] === "Outward";
        }
        else if (fromDate && toDate) {
            const itemDate = new Date(item["inwardDate"]);
            const fromDate = filterValue.fromdate ? new Date(filterValue.fromdate) : null;
            const toDate = filterValue.todate ? new Date(filterValue.todate) : null;
            return matchesSearch && (itemDate >= fromDate && itemDate <= toDate)
        } else if (inwardFrom) {
            return matchesSearch && item["inwardFrom"] === inwardFrom.name;
        }

        return matchesSearch;
    });

    const inwardFromOptions = [
        ...new Set(materialData.map((item) => item.sourceLocation)),
    ].map((value) => ({ id: value, name: value }));

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

    // ✅ Pinned selected rows from ALL materialData — persists across search/page/tab changes
    const pinnedSelectedRows = materialData.filter((item) =>
        selectedRows.some((row) => row.serialNumber === item["serialNumber"])
    );

    // ✅ Only unselected rows from current page — avoids duplicates with pinned section
    const unselectedPageRows = paginatedData.filter(
        (item) =>
            !selectedRows.some((row) => row.serialNumber === item["serialNumber"])
    );

    const handleInputChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(0);
        // ✅ Removed setSelectedRows([]) — selections now persist through search
    };

    const onSelectionChange = (value, field) => {
        setResetSelect(false)
        setFilterValue(prevState => ({
            ...prevState,
            [field]: value
        }));
    }

    const handleApplyFilter = () => {
        console.log(filterValue)
        setFromDate(filterValue.fromdate)
        setToDate(filterValue.todate)
        setInwardFrom(filterValue.inwardFrom);
    }

    const handleClearFilter = () => {
        setFromDate(null);
        setToDate(null);
        setInwardFrom("")
        setFilterValue({})
        setResetSelect(true)
    }

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
                serialNumber: item.serialNumber,
                deliveryNumber: item.deliveryNumber,
                materialNumber: item.materialNumber,
                materialDescription: item.materialDescription
            }));
            // ✅ Merge with existing selections instead of replacing them
            setSelectedRows((prev) => {
                const merged = [...prev];
                allRows.forEach((newRow) => {
                    if (!merged.some((r) => r.serialNumber === newRow.serialNumber)) {
                        merged.push(newRow);
                    }
                });
                return merged;
            });
        } else {
            // ✅ Only deselect rows on the current page, keep others intact
            const currentPageSerials = paginatedData.map((item) => item.serialNumber);
            setSelectedRows((prev) =>
                prev.filter((row) => !currentPageSerials.includes(row.serialNumber))
            );
        }
    };

    const handleCheckboxChange = (serialNumber, deliveryNumber, materialNumber, materialDescription) => {
        setSelectedRows((prev) => {
            const exists = prev.some(
                (row) => row.serialNumber === serialNumber
            );

            if (exists) {
                return prev.filter(
                    (row) => row.serialNumber !== serialNumber
                );
            } else {
                return [
                    ...prev,
                    { serialNumber, deliveryNumber , materialNumber, materialDescription}
                ];
            }
        });
    };

    const isAllSelected =
        selectedRows.length > 0 &&
        paginatedData.every((item) =>
            selectedRows.some(
                (row) => row.serialNumber === item.serialNumber
            )
        );

    const handleDownload = () => {
        const keysToKeep = ["serialNumber", "materialNumber", "inwardDate", "sourceLocation", "receivedBy", "rackLocation", "status"];
        const cleanedData = filteredData.map(item =>
            Object.fromEntries(
                keysToKeep
                    .filter(key => key in item)
                    .map(key => [key, item[key]])
            )
        );
        const dataToExport = selectedRows.length
            ? cleanedData.filter((item) => selectedRows.includes(item["Material Number"]))
            : cleanedData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CII Stock Material Details");
        XLSX.writeFile(workbook, "CII_Stock_Material_Details.xlsx");
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleMaterialClick = (serialNumber, serialData) => {

        navigate(`/cii-stock/${materialNumber}/${serialNumber}`, { state: { serialData, materialDescription } });
    };

    const togglePanel = () => {
        setPanelVisible(!isPanelVisible);
    };

    const handleOpenAddStock = () => {
        if (showStock) {
            fetchMaterialDetails();
            // fetchMaterialAnalysiticsCiiData();
        }
        setShowStock(prevState => !prevState);
    }

    const handleOpenBulkOutward = () => {
        if (showBulkOutwardStock) {
            fetchMaterialDetails();
            // fetchMaterialAnalysiticsCiiData();
            setSelectedRows([]);
        }
        setShowBulkOutwardStock(prevState => !prevState);
    }

    const handleVerticalDotClick = (event, item) => {
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        setSelectedSerialNumber(item.serialNumber)
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

    const handlemovedtoused = () => {
        if (showMovetoused) {
            fetchMaterialDetails();
            // fetchMaterialAnalysiticsCiiData();
        }
        setShowMovedtoused(prevState => !prevState);
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    }

    // ✅ Reusable row renderer — isPinned applies blue highlight styling
    const renderRow = (item, index, isPinned = false) => (
        <div
            key={`${isPinned ? "pinned" : "row"}-${item["serialNumber"]}-${index}`}
            className={`div-data ${isPinned ? "bg-blue-50 border-l-2 border-blue-400" : ""}`}
        >
            <div className="text-center w-[5%]">
                <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedRows.some(
                        (row) => row.serialNumber === item["serialNumber"]
                    )}
                    onChange={() =>
                        handleCheckboxChange(item["serialNumber"], item["deliveryNumber"], item["materialNumber"], item["materialDescription"])
                    }
                />
            </div>
            <div className="table-data text-hyper text-left w-[15%]" onClick={() => handleMaterialClick(item["serialNumber"], item, item["orderNumber"])}>{item["serialNumber"]}</div>
            <div className="table-data text-left w-[15%]">{item["materialNumber"]}</div>
            <div className="table-data text-left w-[15%]">{formatDate(item["inwardDate"])}</div>
            <div className="table-data text-left w-[15%]">{item["sourceLocation"]}</div>
            <div className="table-data text-left w-[15%]">{item["receivedBy"]}</div>
            <div className="table-data text-left w-[20%]">{item["location"]}</div>
            <div className="table-data text-left w-[15%]">{item["rackLocation"]}</div>
            <div className="table-data text-left w-[15%]">
                <span className={`${item["status"] === "New" ? "status-available" : item["status"] === "Damaged" ? "status-not-available" : "status-unknown"}`}>{item["status"]}</span>
            </div>
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
            {showStock && <AddStock value={showStock} materialDescription={materialDescription} materialNumber={materialNumber} handleOpenAddStock={handleOpenAddStock} />}
            {showBulkOutwardStock && <CiiBulkOutwardDialog value={showBulkOutwardStock} materialDescription={materialDescription} materialNumber={materialNumber} selectedData={selectedRows} materialData={materialData} handleOpenBulkOutward={handleOpenBulkOutward} />}
            {showMovetoused && <MovedAlert value={showMovetoused} materialNumber={materialNumber} serialNumber={selectedSerialNumber} handlemovedtoused={handlemovedtoused} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                {/* <span className="main-title">{materialNumber}</span> */}

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
                {/* <div className="outer-secondsection">
                    <div className="outer-firstsection-header">
                        <FilterDateField
                            label="fromdate"
                            placeholder="From Date"
                            onSelectionChange={onSelectionChange}
                            maxDate={filterValue.todate}
                            resetSelect={resetSelect}
                        />
                        <FilterDateField
                            label="todate"
                            placeholder="To Date"
                            onSelectionChange={onSelectionChange}
                            minDate={filterValue.fromdate}
                            resetSelect={resetSelect}
                        />
                        <CustomSelect
                            options={inwardFromOptions}
                            placeholder="Inward From"
                            onSelectionChange={onSelectionChange}
                            resetSelect={resetSelect}
                        />
                    </div>
                    <div className="outer-firstsection-actions">
                        <div className="tick-btn" onClick={handleApplyFilter}><TickButton /></div>
                        <div className="reset-btn" onClick={handleClearFilter}>
                            <CloseButton />
                        </div>
                    </div>
                </div> */}
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
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("serialNumber")}>
                            Serial Number
                            {sortConfig.key === "serialNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("materialNumber")}>
                            Material Number
                            {sortConfig.key === "materialNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("inwardDate")}>
                            Inward Date
                            {sortConfig.key === "inwardDate" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("sourceLocation")}>
                            Inward From
                            {sortConfig.key === "sourceLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("receivedBy")}>
                            Received By
                            {sortConfig.key === "receivedBy" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("location")}>
                            Location
                            {sortConfig.key === "location" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("rackLocation")}>
                            Racks Location
                            {sortConfig.key === "rackLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("status")}>
                            Status
                            {sortConfig.key === "status" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
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

                        {/* ✅ Pinned selected rows — always visible at top regardless of search/page/tab */}
                        {pinnedSelectedRows.length > 0 && (
                            <>
                                {pinnedSelectedRows.map((item, index) =>
                                    renderRow(item, index, true)
                                )}
                                {/* Divider between pinned and normal rows */}
                                {unselectedPageRows.length > 0 && (
                                    <div className="border-t-2 border-blue-200 my-1" />
                                )}
                            </>
                        )}

                        {/* ✅ Unselected rows from current page only (no duplicates with pinned) */}
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
                            onClick={() => handledeleteSerialumber()}
                        >
                            <span><Delete /></span> Delete
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => handlemovedtoused()}
                        >
                            <span><FlipForward /></span> Status Change
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

export default CiiBulkOutward;