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

const MaterialDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const materialNumber = location.pathname.split('/').pop();
    const { materialDescription } = location.state || {};
    const [isPanelVisible, setPanelVisible] = useState(true);
    const [showMovetoused, setShowMovedtoused] = useState(false);
    const breadcrumbData = [
        { label: "CII Stock", path: "/cii-stock" },
        { label: `${materialNumber}`, path: "" },
    ];
    const [materialData, setMaterilaData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [selectedSerialNumber, setSelectedSerialNumber] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [showStock, setShowStock] = useState(false);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

    const fetchMaterialDetails = () => {
        const url = `SmInboundStockCiis/${materialNumber}`
        getRequest(url)
            .then((res) => {
                if (res.status === 200) {
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
        const url = `SmInboundStockCiis/serial/${materialNumber}/${selectedSerialNumber}`
        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    fetchMaterialDetails();
                    setAlertBox({ visible: false, x: 0, y: 0, data: null });
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }


    const filteredData = materialData.filter((item) => {
        const query = searchQuery.toLowerCase();

        const matchesSearch = Object.values(item).some((value) =>
            String(value).toLowerCase().includes(query)
        );

        if (activeTab === "New") {
            return matchesSearch && item["status"] === "New";
        } else if (activeTab === "Used") {
            return matchesSearch && item["status"] === "Used";
        } else if (activeTab === "Defective") {
            return matchesSearch && item["status"] === "Defective";
        } else if (fromDate && toDate) {
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
        ...new Set(Material_data.map((item) => item.inwardFrom)),
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

    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            setSelectedRows(paginatedData.map((item) => item["Material Number"]));
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
        selectedRows.includes(item["Material Number"])
    );

    const handleDownload = () => {
        const dataToExport = selectedRows.length
            ? filteredData.filter((item) => selectedRows.includes(item["Material Number"]))
            : filteredData;
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
        if(showStock){
            fetchMaterialDetails();
        }
        setShowStock(prevState => !prevState);
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
        if(showMovetoused){
            fetchMaterialDetails(); 
        }
        setShowMovedtoused(prevState => !prevState);
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    }
    return (
        <div>
            {showStock && <AddStock value={showStock} materialDescription={materialDescription} materialNumber={materialNumber} handleOpenAddStock={handleOpenAddStock} />}
            {showMovetoused && <MovedAlert value={showMovetoused} materialNumber={materialNumber} serialNumber={selectedSerialNumber} handlemovedtoused={handlemovedtoused} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <span className="main-title">{materialNumber}</span>

                <div className="dashboard-container">
                    <div className="toggle-btn-container">
                        <div onClick={togglePanel} className="toggle-btn">
                            {isPanelVisible ? <MinusSquare /> : <PlusSquare />}
                        </div>
                    </div>

                    {isPanelVisible && (
                        <div className="grid-container">
                            <StockCard title="Total Stock" value="0" bgColor="card1" />
                            <StockCard title="Total Stock in Hand" value="0" bgColor="card2" />
                            <StockCard title="Total Stock Delivered" value="0" bgColor="card3" />
                            <StockCard title="Total Returned Stock" value="0" bgColor="card4" />
                            <StockCard title="Total Stock Used in Hand" value="0" bgColor="card5" />
                            <StockCard title="Total Defective Item" value="0" bgColor="card6" />
                        </div>
                    )}
                </div>

                <div className="outer-firstsection">
                    <div className="outer-firstsection-header">
                        <span className="outer-firstsection-title">{materialDescription}</span>
                    </div>
                    <div className="outer-firstsection-actions">
                        <button className="outer-firstsection-download" onClick={handleDownload}>
                            <Download /> Download
                        </button>
                        <button className="outer-firstsection-add" onClick={handleOpenAddStock}>
                            <Plus /> Add Stock
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
                            className={`tab-button ${activeTab === "Defective" ? "active" : ""}`}
                            onClick={() => setActiveTab("Defective")}
                        >
                            Defective
                        </button>
                    </div>
                    <Search placeholder="Search" onChange={handleInputChange} />
                </div>
                <div className="outer-secondsection">
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
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("serialNumber")}>
                            Serial Number
                            {sortConfig.key === "serialNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("inwardDate")}>
                            Inward Date
                            {sortConfig.key === "inwardDate" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("inwardFrom")}>
                            Inward From
                            {sortConfig.key === "inwardFrom" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("receivedBy")}>
                            Received By
                            {sortConfig.key === "receivedBy" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("rackLocation")}>
                            Racks Location
                            {sortConfig.key === "rackLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[10%]" onClick={() => handleSort("status")}>
                            Status
                            {sortConfig.key === "status" && (
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
                                    checked={selectedRows.includes(item["serialNumber"])}
                                    onChange={() => handleCheckboxChange(item["serialNumber"])}
                                />
                            </div>
                            <div className="table-data text-hyper text-left w-[15%]" onClick={() => handleMaterialClick(item["serialNumber"], item,item["orderNumber"])}>{item["serialNumber"]}</div>
                            <div className="table-data text-left w-[25%]">{formatDate(item["inwardDate"])}</div>
                            <div className="table-data text-left w-[15%]">{item["inwardFrom"]}</div>
                            <div className="table-data text-left w-[10%]">{item["receivedBy"]}</div>
                            <div className="table-data text-left w-[10%]">{item["rackLocation"]}</div>
                            <div className="table-data text-left w-[10%]">
                                <span className={`${item["status"] === "New" ? "status-available" : item["status"] === "Defective" ? "status-not-available" : "status-unknown"}`}>{item["status"]}</span>
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
                            onClick={() => handledeleteSerialumber()}
                        >
                            <span><Delete /></span> Delete
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => handlemovedtoused()}
                        >
                            <span><FlipForward /></span> Move to Used
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

export default MaterialDetail;
