import React, { useState, useEffect } from "react";
import { ReactComponent as TickButton } from "../../assets/svg/tickbutton.svg";
import { ReactComponent as CloseButton } from "../../assets/svg/closebutton.svg";
import { useLocation } from "react-router-dom";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import * as XLSX from "xlsx";
import { ReactComponent as UpArrow } from "../../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../../assets/svg/down-arrow.svg";
import { ReactComponent as VerticalDot } from "../../assets/svg/vertical-dot.svg";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import { ReactComponent as Edit } from "../../assets/svg/edit.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import StockDelivered_Data from "../../data/stock_delivered.json";
import FilterDateField from "../../utils/FilterDateField";
import CustomSelect from "../../utils/CustomSelect";
import AddStockDelivered from "../../dialog/nonciistock-dialog/AddStockDelivered";
import UpdateStockDelivered from "../../dialog/nonciistock-dialog/UpdateStockDelivered";
import { getRequest, postRequest } from "../../services/ApiService";

const StockDelivered = () => {
    const location = useLocation();
    const materialNumber = location.pathname.split('/').pop();
    const { materialDescription } = location.state || {};
    const [showUpdateStockDelivered, setShowUpdateStockDelivered] = useState(false);
    const [selectedMaterialData, setSelectedMaterialData] = useState("");
    const [materialData, setMaterilaData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [showStock, setShowStock] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [showAddDelivered, setShowAddDelivered] = useState(false);
    const [alertBox, setAlertBox] = useState({ visible: false, x: 0, y: 0, data: null });
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });

    const options = [
        { id: 1, name: "Option 1" },
        { id: 2, name: "Option 2" },
        { id: 3, name: "Option 3" },
        { id: 4, name: "Option 4" },
        { id: 5, name: "Option 5" },
    ];

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

    const fetchMaterialDetails = () => {
                debugger
                const url = `SmInboundStockNonCiis/DeliveredDataList/${materialNumber}`
                getRequest(url)
                    .then((res) => {
                        if (res.status === 200) {
                            // res.data.forEach((item) => {
                            //     if (item.inwardDate) item.inwardDate = item.inwardDate;
                            //     if (item.createdDate) item.createdDate = formatDate(item.createdDate);
                            //     if (item.updatedDate) item.updatedDate = formatDate(item.updatedDate);
                            //   });
                            setMaterilaData(res.data);
                        }
                    })
                    .catch((error) => {
                        console.error("API Error:", error);
                    });
    }

    const filteredData = materialData.filter((item) =>
        item["deliveryNumber"].toLowerCase().includes(searchQuery.toLowerCase())
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
            setSelectedRows(paginatedData.map((item) => item["deliveryNumber"]));
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
        selectedRows.includes(item["deliveryNumber"])
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

    const handleDownload = () => {
        const dataToExport = selectedRows.length
            ? filteredData.filter((item) => selectedRows.includes(item["deliveryNumber"]))
            : filteredData;
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Delivered");
        XLSX.writeFile(workbook, "Stock_Delivered.xlsx");
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleOpenAddDelivery = () => {
        if(showAddDelivered){
            fetchMaterialDetails();
        }
        setShowAddDelivered(prevState => !prevState);
    }
    const handleRemoveMaterial = (deliveryNumber,orderNumber) => {
            debugger
                    const url = `SmInboundStockNonCiis/DeleteNonStockDeliverdata/${materialNumber}/${deliveryNumber}/${orderNumber}`
                    postRequest(url)
                      .then((res) => {
                          if (res.status === 200) {
                            alert("Deleted Successfuly");
                            fetchMaterialDetails();
                          }
                      })
                      .catch((error) => {
                          console.error("API Error:", error);
                      });
    }

    const handleVerticalDotClick = (event, item) => {
        debugger
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        setSelectedMaterialData(item)
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

    const handleUpdateStockDelivered = () => {
        if(showUpdateStockDelivered){
            fetchMaterialDetails();
        }
        setShowUpdateStockDelivered(prevState => !prevState);
        setAlertBox({ visible: false, x: 0, y: 0, data: null });
    }
    return (
        <div>
            {showAddDelivered && <AddStockDelivered value={showAddDelivered} materialDescription={materialDescription} handleOpenAddDelivery={handleOpenAddDelivery} />}
            {showUpdateStockDelivered && <UpdateStockDelivered value={showUpdateStockDelivered} materialDescription={materialDescription} selectedMaterialData={selectedMaterialData} handleUpdateStockDelivered={handleUpdateStockDelivered} />}

            <div className="outer-firstsection">
                <div className="outer-firstsection-header">
                    <span className="outer-firstsection-title">{ materialDescription }</span>
                </div>
                <div className="outer-firstsection-actions">
                    <button className="outer-firstsection-download" onClick={handleDownload}>
                        <Download /> Download
                    </button>
                    <button className="outer-firstsection-add" onClick={handleOpenAddDelivery}>
                        <Plus /> Add Delivery
                    </button>
                </div>
            </div>

            <div className="outer-secondsection">
                <div className="tabs">
                    <button className="tab-button active">View all</button>
                    <button className="tab-button">Working</button>
                    <button className="tab-button">Text</button>
                </div>
                <Search placeholder="Search" onChange={handleInputChange} />
            </div>
            <div className="outer-secondsection">
                <div className="outer-firstsection-header">
                    <FilterDateField
                        placeholder="From Date"
                        onChange={handleInputChange}
                    />
                    <FilterDateField
                        placeholder="To Date"
                        onChange={handleInputChange}
                    />
                    <CustomSelect
                        options={options}
                        placeholder="Target Location"
                        onSelectionChange={handleInputChange}
                    />
                </div>
                <div className="outer-firstsection-actions">
                    <div className="tick-btn"><TickButton /></div>
                    <div className="reset-btn">
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
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("deliveryNumber")}>
                        Delivery Number
                        {sortConfig.key === "Order Number" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("orderNumber")}>
                        Order Number
                        {sortConfig.key === "Order Number" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("outboundDate")}>
                        Outbound Date
                        {sortConfig.key === "Outbound Date" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("receiverName")}>
                        Receiver Name
                        {sortConfig.key === "Receiver Name" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("targetLocation")}>
                        Target Location
                        {sortConfig.key === "Target Location" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("deliveredQuantity")}>
                        Quantity Delivered
                        {sortConfig.key === "Quantity Delivered" && (
                            sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                        )}
                    </div>
                    <div className="table-header text-left w-[15%]" onClick={() => handleSort("sentBy")}>
                        Sent By
                        {sortConfig.key === "Sent By" && (
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
                                checked={selectedRows.includes(item["orderNumber"])}
                                onChange={() => handleCheckboxChange(item["orderNumber"])}
                            />
                        </div>
                        <div className="table-data text-left w-[15%]">{item["deliveryNumber"]}</div>
                        <div className="table-data text-left w-[15%]">{item["orderNumber"]}</div>
                        <div className="table-data text-left w-[15%]">{formatDate(item["outboundDate"])}</div>
                        <div className="table-data text-left w-[15%]">{item["receiverName"]}</div>
                        <div className="table-data text-left w-[15%]">{item["targetLocation"]}</div>
                        <div className="table-data text-left w-[15%]">{item["deliveredQuantity"]}</div>
                        <div className="table-data text-left w-[15%]">{item["sentBy"]}</div>
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
                        onClick={() => handleUpdateStockDelivered()}
                    >
                        <span><Edit /></span> Edit
                    </button>
                    <button
                        className="dropdown-item"
                        onClick={() => handleRemoveMaterial(alertBox.data["deliveryNumber"],alertBox.data["orderNumber"])}
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
    );
};

export default StockDelivered;
