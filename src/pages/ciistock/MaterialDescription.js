import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { ReactComponent as Download } from "../../assets/svg/download.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import { ReactComponent as Edit } from "../../assets/svg/edit.svg";
import Search from "../../utils/Search";
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
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
import UpdateCollectionDetails from "../../dialog/ciistock-dialog/UpdateCollectionDetails";
import { postRequest } from "../../services/ApiService";
import { getCookie } from "../../services/Cookies";
import { isLimitedUser } from '../../services/Cookies';
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const MaterialDescription = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [materialNumber, serialNumber] = location.pathname.split('/').slice(-2);
    const { serialData, materialDescription } = location.state || {};
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [returnCurrentPage, setReturnCurrentPage] = useState(0);
    const [returnRowsPerPage, setReturnRowsPerPage] = useState(10);
    const [deliveryData, setDeliveryData] = useState([]);
    const [selectedMaterialData, setSelectedMaterialData] = useState("");
    const [returnData, setReturnData] = useState([]);
    const [ciidata, setCiiData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [showAddDelivery, setShowAddDelivery] = useState(false)
    const [showReturnDelivery, setShowReturnDelivery] = useState(false)
    const [showProductDetails, setShowProductDetails] = useState(false)
    const [showCollectionDetails, setShowCollectionDetails] = useState(false)
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
    const [serialDetails, setSerialDetails] = useState(serialData);

    const breadcrumbData = [
        { label: "CII Stock", path: "/cii-stock" },
        { label: `${materialNumber}`, path: `/cii-stock/${materialNumber}`, state : {materialDescription,serialNumber} },
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
        if (!dateString) return ""; // Return empty string if dateString is null or undefined
    
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ""; // Return empty string if the date is invalid
    
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
    
        return `${day}/${month}/${year}`;
    };

     const FetchSerialData = () => {
            const url = `SmOutboundStockCiis/${materialNumber}/${serialNumber}/${serialData.orderNumber}`;
            
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
                   setCiiData(res.data.ciiData);
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

    const paginatedData = sortedData.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
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

    const paginatedReturnData = sortedReturnData.slice(
        returnCurrentPage * returnRowsPerPage,
        returnCurrentPage * returnRowsPerPage + returnRowsPerPage
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

    const handleReturnChangeRowsPerPage = (event) => {
        setReturnRowsPerPage(parseInt(event.target.value, 10));
        setReturnCurrentPage(0);
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
        debugger
        if(showProductDetails){
            FetchSerialData();
        }
        setShowProductDetails(prevState => !prevState)
    }

    const handleCollectionDetails = () => {
        debugger
        if(showCollectionDetails){
            FetchSerialData();
        }
        setShowCollectionDetails(prevState => !prevState)
    }

    const handleUpdateSerialData = (updatedData) => {
        setSerialDetails(updatedData); // update UI immediately
    };

    const handleInwardDetails = () => {
        if(showInwardDetails){
            FetchSerialData();
        }
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
        setSelectedMaterialData(item);
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

        const handledeleteOutwardData = () => {
        const url = `SmOutboundStockCiis/DeleteOutboundData/${materialNumber}/${serialNumber}/${selectedMaterialData.outBoundStockCIIKey}`
        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Outward Stock Deleted Successfully");
                    FetchSerialData();
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }

    const handledeleteReturnData = () => {
        const url = `SmOutboundStockCiis/DeleteReturnData/${materialNumber}/${serialNumber}/${selectedMaterialData.returnStockCIIKey}`
        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Return Stock Deleted Successfully");
                    FetchSerialData();
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
            {showProductDetails && <UpdateProductDetails value={showProductDetails} serialData={serialData} handleProductDetails={handleProductDetails} updateSerialData={handleUpdateSerialData} />}
            {showCollectionDetails && <UpdateCollectionDetails value={showCollectionDetails} serialData={serialData} handleCollectionDetails={handleCollectionDetails} updateSerialData={handleUpdateSerialData} />}
            {showInwardDetails && <UpdateStockInwardDetails value={showInwardDetails} serialData={serialData} handleInwardDetails={handleInwardDetails} updateSerialData={handleUpdateSerialData} />}
            {showDeliveryDetails && <UpdateDeliveryDetails value={showDeliveryDetails} selectedRow={alertBox.data} serialData={serialData}  handleDeliveryDetails={handleDeliveryDetails} selectedMaterialData={selectedMaterialData} deliveryData={deliveryData} />}
            {showReturnDetails && <UpdateReturnDetails value={showReturnDetails} selectedRow={alertBox.data} serialData={serialData}selectedMaterialData={selectedMaterialData} handleReturnDetails={handleReturnDetails} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <div className="header-wrapper">
                    <span className="main-title-materialDescription">{serialNumber}</span>
                    <div className="button-container">
                        <div className="print-btn">
                            <Delete
                                onClick={() => {
                                    if (!isLimitedUser()) {
                                        handledeleteSerialumber();
                                    }
                                }}
                                className={isLimitedUser() ? "cursor-not-allowed" : "cursor-pointer"}
                            />
                        </div>
                        <div className="print-btn" onClick={handlepdfDownload}><Download /></div>

                        <button className="outer-firstsection-download" onClick={handleReturnDelivery} disabled={isLimitedUser()}>
                            <Plus /> Add Return
                        </button>
                        <button className="outer-firstsection-add" onClick={handleAddDelivery} disabled={isLimitedUser()}>
                            <Plus /> Add Outward
                        </button>
                    </div>
                </div>
                {/* <div className="product-title">
                    <img className="w-20 h-20" src="/assets/images/package.png" alt="User" />
                    <span className="product-text">{materialDescription}</span>
                </div> */}

                <div className="delivery-details-card">
                    {/* <span className="product-details-title">Outward Details</span> */}

                </div>
                    <div className="outer-secondsection">
                        <span className="product-details-title">Product Details</span>
                        <Edit
                            className={`${getCookie("userType") === "Viewer" || getCookie("userType") === "CollectionPointer" ? "cursor-not-allowed" : "cursor"}`}
                            onClick={(event) => {
                                if (getCookie("userType") !== "Viewer" && getCookie("userType") !== "CollectionPointer") {
                                    handleProductDetails();
                                }
                            }}
                        />
                    </div>
                <div className="product-details-card">
                    <div class="product-details">
                        <div class="detail-item">
                            <span class="detail-label">Material Number</span>
                            <span class="detail-value">{materialNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Serial Number</span>
                            <span class="detail-value">{serialData.serialNumber}</span>
                        </div>
                        {/* <div class="detail-item">
                            <span class="detail-label">Rack location</span>
                            <span class="detail-value">{serialDetails.rackLocation}</span>
                        </div> */}
                        <div class="detail-item">
                            <span class="detail-label">Quality Checker Date</span>
                            <span class="detail-value">{formatDate(serialDetails.qualityCheckDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Quality Checker</span>
                            <span class="detail-value">{serialDetails.qualityChecker}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Quality Checker Status</span>
                            <span class="detail-value">{serialDetails.qualityCheckerStatus}</span>
                        </div>
                    </div>

                </div>

                <div className="delivery-details-card">
                    {/* <span className="product-details-title">Outward Details</span> */}

                </div>
                    <div className="outer-secondsection">
                        <span className="product-details-title">Collection Point Details</span>
                        <Edit
                            className={`${getCookie("userType") === "Viewer" || getCookie("userType") === "QualityChecker" ? "cursor-not-allowed" : "cursor"}`}
                            onClick={(event) => {
                                if (getCookie("userType") !== "Viewer" && getCookie("userType") !== "QualityChecker") {
                                    handleCollectionDetails();
                                }
                            }}
                        />
                    </div>
                <div className="product-details-card">
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
                            <span class="detail-value">{serialDetails.rackLocation}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Collection Point Date</span>
                            <span class="detail-value">{formatDate(serialDetails.collectionPointDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Collection Pointer Name</span>
                            <span class="detail-value">{serialDetails.collectionPointerName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Collection Point Status</span>
                            <span class="detail-value">{serialDetails.collectionPointStatus}</span>
                        </div>
                    </div>

                </div>

                <div className="delivery-details-card">
                    {/* <span className="product-details-title">Outward Details</span> */}

                </div>
                    <div className="outer-secondsection">
                        <span className="product-details-title">Inward Details</span>
                    <Edit
                        className={isLimitedUser() ? "cursor-not-allowed" : "cursor-pointer"}
                        onClick={(event) => {
                            if (!isLimitedUser()) {
                                handleInwardDetails();
                            }
                        }}
                    />

                    </div>
                    <div className="product-details-card">
                    <div class="product-details">
                        <div class="detail-item">
                            <span class="detail-label">Delivery Number</span>
                            <span class="detail-value">{serialDetails.deliveryNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Order Number</span>
                            <span class="detail-value">{serialDetails.orderNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Inward Date</span>
                            <span class="detail-value">{formatDate(serialDetails.inwardDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Inward From</span>
                            <span class="detail-value">{serialDetails.sourceLocation}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Received By</span>
                            <span class="detail-value">{serialDetails.receivedBy}</span>
                        </div>
                    </div>
                </div>
                <div className="delivery-details-card">
                    {/* <span className="product-details-title">Outward Details</span> */}

                </div>
                <div className="outer-secondsection">
                    {/* <div >

                    </div> */}
                    {/* <Search onChange={handleInputChange} /> */}
                    <span className="product-details-title">Outward Details</span>
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
                            <div className="table-data text-left w-[15%]">{formatDate(item["outBoundDate"])}</div>
                            <div className="table-data text-left w-[15%]">{item["receiverName"]}</div>
                            <div className="table-data text-left w-[20%]">{item["targetLocation"]}</div>
                            <div className="table-data text-left w-[20%]">{item["sentby"]}</div>
                            <div className="table-data text-center w-[10%]">
                                <VerticalDot
                                    className={isLimitedUser() ? "cursor-not-allowed" : "cursor-pointer"}
                                    onClick={(event) => {
                                        if (!isLimitedUser()) {
                                            handleVerticalDotClick(event, item, "delivery");
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
                            onClick={() => alertBox.table === "delivery" ? setShowDeliveryDetails(true) : alertBox.table === "return" ? setShowReturnDetails(true) : ""}
                        >
                            <span><Edit /></span> Update
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() =>
                                alertBox.table === "return"
                                    ? handledeleteReturnData()
                                    : handledeleteOutwardData()
                            }

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

                <div className="delivery-details-card">
                    {/* <span className="product-details-title">Return Details</span> */}
                </div>
                <div className="outer-secondsection">
                    {/* <div >

                    </div> */}
                    {/* <Search onChange={handleReturnInputChange} /> */}
                    <span className="product-details-title">Return Details</span>
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
                            <div className="table-data text-center w-[5%]">
                                <VerticalDot
                                    className={isLimitedUser() ? "cursor-not-allowed" : "cursor-pointer"}
                                    onClick={(event) => {
                                        if (!isLimitedUser()) {
                                            handleVerticalDotClick(event, item, "return");
                                        }
                                    }}
                                />
                            </div>

                        </div>
                    ))}
                </div>
                <div className="table-footer">
                    <div className="table-pagination">
                        <Pagination
                            count={Math.ceil(sortedReturnData.length / returnRowsPerPage)}
                            page={returnCurrentPage + 1}
                            onChange={(event, value) => handleReturnPageChange(event, value - 1)}
                            variant="outlined"
                            shape="rounded"
                        />
                    </div>
                    <TablePagination
                        component="div"
                        count={sortedReturnData.length}
                        page={returnCurrentPage}
                        onPageChange={handleReturnPageChange}
                        rowsPerPage={returnRowsPerPage}
                        onRowsPerPageChange={handleReturnChangeRowsPerPage}
                        nextIconButtonProps={{ style: { display: 'none' } }}
                        backIconButtonProps={{ style: { display: 'none' } }}
                    />
                </div>

            </div>
        </div>
    );
};

export default MaterialDescription;
