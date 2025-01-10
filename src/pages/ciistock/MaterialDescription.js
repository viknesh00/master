import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import { ReactComponent as Edit } from "../../assets/svg/edit.svg";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import { ReactComponent as UpArrow } from "../../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../../assets/svg/down-arrow.svg";
import { ReactComponent as VerticalDot } from "../../assets/svg/vertical-dot.svg";
import MaterialDetails_data from "../../data/material_details_data.json";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AddDeliveryStock from "../../dialog/ciistock-dialog/AddDeliveryStock";
import AddReturnStock from "../../dialog/ciistock-dialog/AddReturnStock";
import UpdateProductDetails from "../../dialog/ciistock-dialog/UpdateProductDetails";
import UpdateStockInwardDetails from "../../dialog/ciistock-dialog/UpdateStockInwardDetails";
import UpdateDeliveryDetails from "../../dialog/ciistock-dialog/UpdateDeliveryDetails";
import UpdateReturnDetails from "../../dialog/ciistock-dialog/UpdateReturnDetails";
import { postRequest } from "../../services/ApiService";

const MaterialDescription = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [materialNumber, serialNumber] = location.pathname.split('/').slice(-2);
    const { serialData, materialDescription } = location.state || {};
    const [currentPage, setCurrentPage] = useState(1);
    const [returnCurrentPage, setReturnCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [deliveryData, setDeliveryData] = useState([]);
    const [returnData, setReturnData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [showAddDelivery, setShowAddDelivery] = useState(false)
    const [showReturnDelivery, setShowReturnDelivery] = useState(false)
    const [showProductDetails, setShowProductDetails] = useState(false)
    const [showDeliveryDetails, setShowDeliveryDetails] = useState(false)
    const [showReturnDetails, setShowReturnDetails] = useState(false)
    const [showInwardDetails, setShowInwardDetails] = useState(false)
    const [alertBox, setAlertBox] = useState({ visible: false, x: 0, y: 0, data: null, table: null });
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });

    const [returnSearchQuery, setReturnSearchQuery] = useState("");
    const [returnSelectedRows, setReturnSelectedRows] = useState([]);
    const [returnSortConfig, setReturnSortConfig] = useState({
        key: "",
        direction: "asc",
    });

    const breadcrumbData = [
        { label: "CII Stock", path: "/cii-stock" },
        { label: `${materialNumber}`, path: `/cii-stock/${materialNumber}`, state : {materialDescription} },
        { label: `${serialNumber}`, path: "" },
    ];

    useEffect(() => {
        FetchSerialData();
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

     const FetchSerialData = () => {
            const url = `SmOutboundStockCiis/${materialNumber}/${serialNumber}`;
            
            postRequest(url)
              .then((res) => {
                  if (res.status === 200) {
                      res.data.deliveryData.forEach((item) => {
                          if (item.inwardDate) item.inwardDate = formatDate(item.inwardDate);
                          if (item.outBoundDate) item.outBoundDate = formatDate(item.outBoundDate);
                      });
                      res.data.inboundData.forEach((item) => {
                          if (item.returnedDate) item.returnedDate = formatDate(item.returnedDate);
                      }); 
                   setDeliveryData(res.data.deliveryData)
                   setReturnData(res.data.inboundData)
                  }
              })
              .catch((error) => {
                  console.error("API Error:", error);
              });
        };

    const handlepdfDownload = () => {
        const elementToDownload = document.querySelector(".outersection-container");

        html2canvas(elementToDownload, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("MaterialDescription.pdf");
        });
    };

    const filteredData = deliveryData.filter((item) =>
        item["outBoundOrderNumber"].toLowerCase().includes(searchQuery.toLowerCase())
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

    const filteredReturnData = returnData.filter((item) =>
        item["orderNumber"].toLowerCase().includes(returnSearchQuery.toLowerCase())
    );

    const sortedReturnData = [...filteredReturnData].sort((a, b) => {
        if (returnSortConfig.key) {
            const aValue = a[returnSortConfig.key];
            const bValue = b[returnSortConfig.key];
            if (typeof aValue === "number" && typeof bValue === "number") {
                return returnSortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
            } else if (typeof aValue === "string" && typeof bValue === "string") {
                return returnSortConfig.direction === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
        }
        return 0;
    });

    const returnTotalPages = Math.ceil(sortedReturnData.length / rowsPerPage);
    const paginatedReturnData = sortedReturnData.slice(
        (returnCurrentPage - 1) * rowsPerPage,
        returnCurrentPage * rowsPerPage
    );

    const handleInputChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
        setSelectedRows([]);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleReturnInputChange = (value) => {
        setReturnSearchQuery(value);
        setReturnCurrentPage(1);
        setReturnSelectedRows([]);
    };

    const handleReturnPageChange = (event, value) => {
        setReturnCurrentPage(value);
    };

    const handleReturnSort = (key) => {
        let direction = "asc";
        if (returnSortConfig.key === key && returnSortConfig.direction === "asc") {
            direction = "desc";
        }
        setReturnSortConfig({ key, direction });
    };

    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            setSelectedRows(paginatedData.map((item) => item["outBoundOrderNumber"]));
        } else {
            setSelectedRows([]);
        }
    };

    const handleCheckboxChange = (outBoundOrderNumber) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(outBoundOrderNumber)
                ? prevSelectedRows.filter((item) => item !== outBoundOrderNumber)
                : [...prevSelectedRows, outBoundOrderNumber]
        );
    };

    const isAllSelected = selectedRows.length > 0 && paginatedData.every((item) =>
        selectedRows.includes(item["outBoundOrderNumber"])
    );

    // Return Table Handlers
    const handleReturnSelectAllChange = (event) => {
        if (event.target.checked) {
            setReturnSelectedRows(paginatedReturnData.map((item) => item["orderNumber"]));
        } else {
            setReturnSelectedRows([]);
        }
    };

    const handleReturnCheckboxChange = (orderNumber) => {
        setReturnSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(orderNumber)
                ? prevSelectedRows.filter((item) => item !== orderNumber)
                : [...prevSelectedRows, orderNumber]
        );
    };

    const isReturnAllSelected = selectedRows.length > 0 && paginatedReturnData.every((item) =>
        returnSelectedRows.includes(item["orderNumber"])
    );

    const handleAddDelivery = () => {
        if(showAddDelivery){
            FetchSerialData();
        }
        setShowAddDelivery(prevState => !prevState)
    }

    const handleReturnDelivery = () => {
        if(showReturnDelivery){
            FetchSerialData();
        }
        setShowReturnDelivery(prevState => !prevState)
    }

    const handleProductDetails = () => {
        setShowProductDetails(prevState => !prevState)
    }

    const handleInwardDetails = () => {
        setShowInwardDetails(prevState => !prevState)
    }

    const handleDeliveryDetails = () => {
        if(showDeliveryDetails){
            FetchSerialData();
        }
        setShowDeliveryDetails(prevState => !prevState);
    }

    const handleReturnDetails = () => {
        if(showReturnDetails){
            FetchSerialData();
        }
        setShowReturnDetails(prevState => !prevState);
    }

    const handleCloseAlert = () => {
        setAlertBox({ visible: false, x: 0, y: 0, data: null, table: null });
    }

    const handleVerticalDotClick = (event, item, name) => {
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        setAlertBox({
            visible: true,
            x: rect.left - 100,
            y: rect.bottom + window.scrollY + 10,
            data: item,
            table: name,
        });
    };

    const handledeleteSerialumber = () => {
        const url = `SmInboundStockCiis/serial/${materialNumber}/${serialNumber}`
        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    navigate(`/cii-stock/${materialNumber}`, { state: { materialDescription } });
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }

    return (
        <div>
            {showReturnDelivery && <AddReturnStock value={showReturnDelivery} serialData={serialData} handleReturnDelivery={handleReturnDelivery} />}
            {showAddDelivery && <AddDeliveryStock value={showAddDelivery} serialData={serialData} handleAddDelivery={handleAddDelivery} />}
            {showProductDetails && <UpdateProductDetails value={showProductDetails} serialData={serialData} handleProductDetails={handleProductDetails} />}
            {showInwardDetails && <UpdateStockInwardDetails value={showInwardDetails} handleInwardDetails={handleInwardDetails} />}
            {showDeliveryDetails && <UpdateDeliveryDetails value={showDeliveryDetails} selectedRow={alertBox.data} serialData={serialData}  handleDeliveryDetails={handleDeliveryDetails} />}
            {showReturnDetails && <UpdateReturnDetails value={showReturnDetails} selectedRow={alertBox.data} serialData={serialData} handleReturnDetails={handleReturnDetails} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <div className="header-wrapper">
                    <span className="main-title">{serialNumber}</span>
                    <div className="button-container">
                        <div className="print-btn" onClick={handledeleteSerialumber}><Delete /></div>
                        <div className="print-btn" onClick={handlepdfDownload}><Download /></div>

                        <button className="outer-firstsection-download" onClick={handleReturnDelivery}>
                            <Plus /> Add Return
                        </button>
                        <button className="outer-firstsection-add" onClick={handleAddDelivery}>
                            <Plus /> Add Delivery
                        </button>
                    </div>
                </div>
                <div className="product-title">
                    <img className="w-20 h-20" src="/assets/images/package.png" alt="User" />
                    <span className="product-text">{materialDescription}</span>
                </div>

                <div className="product-details-card">
                    <div className="product-details-header">
                        <span className="product-details-title">Product Details</span>
                        <Edit className="cursor" onClick={handleProductDetails} />
                    </div>

                    <div class="product-details">
                        <div class="detail-item">
                            <span class="detail-label">Material Number</span>
                            <span class="detail-value">{materialNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Serial Number</span>
                            <span class="detail-value">{serialData.serialNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Rack location</span>
                            <span class="detail-value">{serialData.rackLocation}</span>
                        </div>
                    </div>

                </div>

                <div className="product-details-card">
                    <div className="product-details-header">
                        <span className="product-details-title">Inward Details</span>
                        <Edit className="cursor" onClick={handleInwardDetails} />
                    </div>

                    <div class="product-details">
                        <div class="detail-item">
                            <span class="detail-label">Delivery Number</span>
                            <span class="detail-value">{serialData.deliveryNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Order Number</span>
                            <span class="detail-value">{serialData.orderNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Inward Date</span>
                            <span class="detail-value">{serialData.inwardDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Inward From</span>
                            <span class="detail-value"></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Received By</span>
                            <span class="detail-value">{serialData.receivedBy}</span>
                        </div>
                    </div>
                </div>
                <div className="delivery-details-card">
                    <span className="product-details-title">Delivery Details</span>

                </div>
                <div className="outer-secondsection">
                    <div >

                    </div>
                    <Search onChange={handleInputChange} />
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
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("outBoundOrderNumber")}>
                            Order Number
                            {sortConfig.key === "outBoundOrderNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("outBoundDate")}>
                            Outbound Date
                            {sortConfig.key === "outBoundDate" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("receivedBy")}>
                            Receiver Name
                            {sortConfig.key === "receivedBy" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("targetLocation")}>
                            Target Location
                            {sortConfig.key === "targetLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("sentby")}>
                            Send By
                            {sortConfig.key === "sentby" && (
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
                                    checked={selectedRows.includes(item["outBoundOrderNumber"])}
                                    onChange={() => handleCheckboxChange(item["outBoundOrderNumber"])}
                                />
                            </div>
                            <div className="table-data text-left w-[15%]">{item["outBoundOrderNumber"]}</div>
                            <div className="table-data text-left w-[15%]">{item["outBoundDate"]}</div>
                            <div className="table-data text-left w-[15%]">{item["receivedBy"]}</div>
                            <div className="table-data text-left w-[20%]">{item["targetLocation"]}</div>
                            <div className="table-data text-left w-[20%]">{item["sentby"]}</div>
                            <div className="table-data text-center w-[10%]"><VerticalDot onClick={(event) => handleVerticalDotClick(event, item, "delivery")} /></div>
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
                            onClick={() => alertBox.table === "delivery" ? setShowDeliveryDetails(true) : alertBox.table === "return" ? setShowReturnDetails(true) : ""}
                        >
                            <span><Edit /></span> Update
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

                <div className="delivery-details-card">
                    <span className="product-details-title">Return Details</span>
                </div>
                <div className="outer-secondsection">
                    <div >

                    </div>
                    <Search onChange={handleReturnInputChange} />
                </div>
                <div className="div-table">
                    <div className="div-head">
                        <div className="text-center w-[5%]">
                            <input
                                type="checkbox"
                                className="table-checkbox"
                                checked={isReturnAllSelected}
                                onChange={handleReturnSelectAllChange}
                            />
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleReturnSort("orderNumber")}>
                            Order Number
                            {returnSortConfig.key === "orderNumber" && (
                                returnSortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleReturnSort("locationReturnedFrom")}>
                            Return Location
                            {returnSortConfig.key === "locationReturnedFrom" && (
                                returnSortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleReturnSort("returnedDate")}>
                            Return Date
                            {returnSortConfig.key === "returnedDate" && (
                                returnSortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleReturnSort("returnedBy")}>
                            Recieved By
                            {returnSortConfig.key === "returnedBy" && (
                                returnSortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleReturnSort("returnType")}>
                            Return Type
                            {returnSortConfig.key === "returnType" && (
                                returnSortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleReturnSort("returnedReason")}>
                            Reason
                            {returnSortConfig.key === "returnedReason" && (
                                returnSortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[5%]"></div>
                    </div>

                    {paginatedReturnData.map((item, index) => (
                        <div key={index} className="div-data">
                            <div className="text-center w-[5%]">
                                <input
                                    type="checkbox"
                                    className="table-checkbox"
                                    checked={returnSelectedRows.includes(item["orderNumber"])}
                                    onChange={() => handleReturnCheckboxChange(item["orderNumber"])}
                                />
                            </div>
                            <div className="table-data text-left w-[15%]">{item["orderNumber"]}</div>
                            <div className="table-data text-left w-[15%]">{item["locationReturnedFrom"]}</div>
                            <div className="table-data text-left w-[15%]">{item["returnedDate"]}</div>
                            <div className="table-data text-left w-[15%]">{item["returnedBy"]}</div>
                            <div className="table-data text-left w-[15%]">{item["returnType"]}</div>
                            <div className="table-data text-left w-[15%]">{item["returnedReason"]}</div>
                            <div className="table-data text-center w-[5%]"><VerticalDot onClick={(event) => handleVerticalDotClick(event, item, "return")} /></div>
                        </div>
                    ))}
                </div>
                <div className="table-footer">
                    <Pagination
                        count={returnTotalPages}
                        page={currentPage}
                        onChange={handleReturnPageChange}
                        variant="outlined"
                        shape="rounded"
                    />
                </div>

            </div>
        </div>
    );
};

export default MaterialDescription;
