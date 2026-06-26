import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getRequest, postRequest } from "../../services/ApiService";
import { useUser } from "../../UserContext";
import { ToastError } from "../../services/ToastMsg";
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
import { ReactComponent as UpArrow } from "../../assets/svg/up-arrow.svg";
import { ReactComponent as DownArrow } from "../../assets/svg/down-arrow.svg";

const NonciiOutwardDetail = () => {
    const location = useLocation();
    const { name } = useUser();

    // Extract params from URL: /non-cii-stock/:materialNumber/:deliveryNumber
    const pathParts = location.pathname.split('/');
    const deliveryNumber = pathParts.pop();
    pathParts.pop(); // typically 'non-cii-bulk-outward'

    const { itemData, materialDescription } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [inwardDetails, setInwardDetails] = useState(itemData || {});
    const [actualMaterialNumber, setActualMaterialNumber] = useState("");
    const [actualMaterialDescription, setActualMaterialDescription] = useState("");

    // Related lists
    const [deliveryData, setDeliveryData] = useState([]);
    const [usedData, setUsedData] = useState([]);
    const [returnedData, setReturnedData] = useState([]);

    // Sort config
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

    // Pagination for Outward Details
    const [outwardPage, setOutwardPage] = useState(0);
    const [outwardRowsPerPage, setOutwardRowsPerPage] = useState(5);

    // Pagination for Used Details
    const [usedPage, setUsedPage] = useState(0);
    const [usedRowsPerPage, setUsedRowsPerPage] = useState(5);

    // Pagination for Return Details
    const [returnPage, setReturnPage] = useState(0);
    const [returnRowsPerPage, setReturnRowsPerPage] = useState(5);

    const breadcrumbData = [
        { label: "Non-CII Stock", path: "/non-cii-stock" },
        { label: "Non-CII Bulk Outward", path: "/non-cii-bulk-outward" },
        { label: `${deliveryNumber}`, path: "" }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        if (itemData) {
            setInwardDetails(itemData);
            setActualMaterialNumber(itemData.materialNumber);
            setActualMaterialDescription(itemData.materialDescription || materialDescription || "");
            fetchRelatedData(itemData.materialNumber, itemData.inboundStockNonCIIKey);
        } else {
            setLoading(true);
            const url = `SmInboundStockNonCiis/GetInwardNonStockCiis/all/${name}`;
            getRequest(url)
                .then((res) => {
                    if (res.status === 200) {
                        const matched = res.data.find(x => x.deliveryNumber === deliveryNumber);
                        if (matched) {
                            setInwardDetails(matched);
                            setActualMaterialNumber(matched.materialNumber);
                            setActualMaterialDescription(matched.materialDescription || materialDescription || "");
                            fetchRelatedData(matched.materialNumber, matched.inboundStockNonCIIKey);
                        } else {
                            setLoading(false);
                            ToastError("Delivery details not found.");
                        }
                    }
                })
                .catch((error) => {
                    console.error("API Error:", error);
                    setLoading(false);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deliveryNumber, itemData]);

    const fetchRelatedData = (matNum, inboundKey) => {
        setLoading(true);
        Promise.all([
            getRequest(`SmInboundStockNonCiis/DeliveredDataList/${matNum}`),
            postRequest(`SmInboundStockNonCiis/GetNonStockUsedData/${matNum}`),
            postRequest(`SmInboundStockNonCiis/GetNonStockReturnData/${matNum}`)
        ])
        .then(([deliveredRes, usedRes, returnRes]) => {
            // Filter delivered data
            if (deliveredRes.status === 200) {
                const filteredDelivered = deliveredRes.data.filter(
                    item => item.inboundStockNonCIIKey === inboundKey || item.inboundStockNonCiiKey === inboundKey
                );
                setDeliveryData(filteredDelivered);
            }
            // Filter used data
            if (usedRes.status === 200) {
                const filteredUsed = usedRes.data.filter(
                    item => item.inboundStockNonCIIKey === inboundKey || item.inboundStockNonCiiKey === inboundKey
                );
                setUsedData(filteredUsed);
            }
            // Filter returned data
            if (returnRes.status === 200) {
                const filteredReturned = returnRes.data.filter(
                    item => item.inboundStockNonCIIKey === inboundKey || item.inboundStockNonCiiKey === inboundKey
                );
                setReturnedData(filteredReturned);
            }
        })
        .catch(error => {
            console.error("Error fetching related details:", error);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortData = (data) => {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
                return sortConfig.direction === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
            }
            const aStr = String(aVal || "").toLowerCase();
            const bStr = String(bVal || "").toLowerCase();
            return sortConfig.direction === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        });
    };

    return (
        <div>
            {loading && (
                <div className="loader-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <div className="outer-firstsection">
                    <div className="outer-firstsection-header">
                        <span className="outer-firstsectioncii-title">{actualMaterialNumber}</span>
                        {actualMaterialDescription && (
                            <span className="outer-firstsectioncii-title"> - {actualMaterialDescription}</span>
                        )}
                    </div>
                </div>

                {/* Product Details Section */}
                <div className="outer-secondsection mt-6">
                    <span className="product-details-title">Product Details</span>
                </div>
                <div className="product-details-card">
                    <div className="product-details">
                        <div className="detail-item">
                            <span className="detail-label">Material Number</span>
                            <span className="detail-value">{actualMaterialNumber}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Material Description</span>
                            <span className="detail-value">{actualMaterialDescription || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Inward Details Section */}
                <div className="outer-secondsection mt-6">
                    <span className="product-details-title">Inward Details</span>
                </div>
                <div className="product-details-card">
                    <div className="product-details">
                        <div className="detail-item">
                            <span className="detail-label">Delivery Number</span>
                            <span className="detail-value">{inwardDetails.deliveryNumber || "N/A"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Order Number</span>
                            <span className="detail-value">{inwardDetails.orderNumber || "N/A"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Inward Date</span>
                            <span className="detail-value">{formatDate(inwardDetails.inwardDate)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Inward From</span>
                            <span className="detail-value">{inwardDetails.sourceLocation || "N/A"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Received By</span>
                            <span className="detail-value">{inwardDetails.receivedBy || "N/A"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Quantity Received</span>
                            <span className="detail-value">{inwardDetails.totalQuantity || "0"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Current Stock</span>
                            <span className="detail-value">{inwardDetails.deliveredQuantity || "0"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Racks Location</span>
                            <span className="detail-value">{inwardDetails.rackLocation || "N/A"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Status</span>
                            <span className="detail-value">
                                <span className={`${inwardDetails.status === "New" ? "status-available" : inwardDetails.status === "Damaged" ? "status-not-available" : "status-unknown"}`}>
                                    {inwardDetails.status || "New"}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Outward/Delivered Details Table */}
                <div className="outer-secondsection mt-6">
                    <span className="product-details-title">Outward Details</span>
                </div>
                <div className="div-table">
                    <div className="div-head">
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("orderNumber")}>
                            Order Number
                            {sortConfig.key === "orderNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("outboundDate")}>
                            Outbound Date
                            {sortConfig.key === "outboundDate" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("targetLocation")}>
                            Target Location
                            {sortConfig.key === "targetLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("deliveredQuantity")}>
                            Quantity Delivered
                            {sortConfig.key === "deliveredQuantity" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[20%]" onClick={() => handleSort("receiverName")}>
                            Receiver Name
                            {sortConfig.key === "receiverName" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[15%]" onClick={() => handleSort("sentBy")}>
                            Sent By
                            {sortConfig.key === "sentBy" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {deliveryData.length === 0 ? (
                            <div className="no-data-msg text-center py-4 text-gray-500">No outward records found.</div>
                        ) : (
                            sortData(deliveryData)
                                .slice(outwardPage * outwardRowsPerPage, outwardPage * outwardRowsPerPage + outwardRowsPerPage)
                                .map((item, index) => (
                                    <div key={index} className="div-data">
                                        <div className="table-data text-left w-[15%]">{item.orderNumber || "N/A"}</div>
                                        <div className="table-data text-left w-[15%]">{formatDate(item.outboundDate)}</div>
                                        <div className="table-data text-left w-[20%]">{item.targetLocation || "N/A"}</div>
                                        <div className="table-data text-left w-[15%]">{item.deliveredQuantity || "0"}</div>
                                        <div className="table-data text-left w-[20%]">{item.receiverName || "N/A"}</div>
                                        <div className="table-data text-left w-[15%]">{item.sentBy || "N/A"}</div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
                {deliveryData.length > 0 && (
                    <div className="table-footer">
                        <div className="table-pagination">
                            <Pagination
                                count={Math.ceil(deliveryData.length / outwardRowsPerPage)}
                                page={outwardPage + 1}
                                onChange={(event, value) => setOutwardPage(value - 1)}
                                variant="outlined"
                                shape="rounded"
                            />
                        </div>
                        <TablePagination
                            component="div"
                            count={deliveryData.length}
                            page={outwardPage}
                            onPageChange={(e, val) => setOutwardPage(val)}
                            rowsPerPage={outwardRowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setOutwardRowsPerPage(parseInt(e.target.value, 10));
                                setOutwardPage(0);
                            }}
                            nextIconButtonProps={{ style: { display: "none" } }}
                            backIconButtonProps={{ style: { display: "none" } }}
                        />
                    </div>
                )}

                {/* Used Stock Details Table */}
                <div className="outer-secondsection mt-6">
                    <span className="product-details-title">Used Details</span>
                </div>
                <div className="div-table">
                    <div className="div-head">
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("orderNumber")}>
                            Order Number
                            {sortConfig.key === "orderNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("returnLocation")}>
                            Used Location
                            {sortConfig.key === "returnLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("returnDate")}>
                            Used Date
                            {sortConfig.key === "returnDate" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[25%]" onClick={() => handleSort("itemQuantity")}>
                            Quantity Used
                            {sortConfig.key === "itemQuantity" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {usedData.length === 0 ? (
                            <div className="no-data-msg text-center py-4 text-gray-500">No used stock records found.</div>
                        ) : (
                            sortData(usedData)
                                .slice(usedPage * usedRowsPerPage, usedPage * usedRowsPerPage + usedRowsPerPage)
                                .map((item, index) => (
                                    <div key={index} className="div-data">
                                        <div className="table-data text-left w-[25%]">{item.orderNumber || "N/A"}</div>
                                        <div className="table-data text-left w-[25%]">{item.returnLocation || "N/A"}</div>
                                        <div className="table-data text-left w-[25%]">{formatDate(item.returnDate)}</div>
                                        <div className="table-data text-left w-[25%]">{item.itemQuantity || "0"}</div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
                {usedData.length > 0 && (
                    <div className="table-footer">
                        <div className="table-pagination">
                            <Pagination
                                count={Math.ceil(usedData.length / usedRowsPerPage)}
                                page={usedPage + 1}
                                onChange={(event, value) => setUsedPage(value - 1)}
                                variant="outlined"
                                shape="rounded"
                            />
                        </div>
                        <TablePagination
                            component="div"
                            count={usedData.length}
                            page={usedPage}
                            onPageChange={(e, val) => setUsedPage(val)}
                            rowsPerPage={usedRowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setUsedRowsPerPage(parseInt(e.target.value, 10));
                                setUsedPage(0);
                            }}
                            nextIconButtonProps={{ style: { display: "none" } }}
                            backIconButtonProps={{ style: { display: "none" } }}
                        />
                    </div>
                )}

                {/* Return Details Table */}
                <div className="outer-secondsection mt-6">
                    <span className="product-details-title">Return Details</span>
                </div>
                <div className="div-table">
                    <div className="div-head">
                        <div className="table-header text-left w-[12%]" onClick={() => handleSort("orderNumber")}>
                            Order Number
                            {sortConfig.key === "orderNumber" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[13%]" onClick={() => handleSort("locationReturnedFrom")}>
                            Return Location
                            {sortConfig.key === "locationReturnedFrom" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[13%]" onClick={() => handleSort("returnedDate")}>
                            Return Date
                            {sortConfig.key === "returnedDate" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[12%]" onClick={() => handleSort("qunatity")}>
                            Return Qty
                            {sortConfig.key === "qunatity" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[13%]" onClick={() => handleSort("returnedBy")}>
                            Received By
                            {sortConfig.key === "returnedBy" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[12%]" onClick={() => handleSort("rackLocation")}>
                            Rack Location
                            {sortConfig.key === "rackLocation" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[13%]" onClick={() => handleSort("returnType")}>
                            Return Type
                            {sortConfig.key === "returnType" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                        <div className="table-header text-left w-[12%]" onClick={() => handleSort("returnReason")}>
                            Reason
                            {sortConfig.key === "returnReason" && (
                                sortConfig.direction === "asc" ? <UpArrow /> : <DownArrow />
                            )}
                        </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {returnedData.length === 0 ? (
                            <div className="no-data-msg text-center py-4 text-gray-500">No return records found.</div>
                        ) : (
                            sortData(returnedData)
                                .slice(returnPage * returnRowsPerPage, returnPage * returnRowsPerPage + returnRowsPerPage)
                                .map((item, index) => (
                                    <div key={index} className="div-data">
                                        <div className="table-data text-left w-[12%]">{item.orderNumber || "N/A"}</div>
                                        <div className="table-data text-left w-[13%]">{item.locationReturnedFrom || "N/A"}</div>
                                        <div className="table-data text-left w-[13%]">{formatDate(item.returnedDate)}</div>
                                        <div className="table-data text-left w-[12%]">{item.qunatity || item.quantity || "0"}</div>
                                        <div className="table-data text-left w-[13%]">{item.returnedBy || "N/A"}</div>
                                        <div className="table-data text-left w-[12%]">{item.rackLocation || "N/A"}</div>
                                        <div className="table-data text-left w-[13%]">{item.returnType || "N/A"}</div>
                                        <div className="table-data text-left w-[12%]">{item.returnReason || "N/A"}</div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
                {returnedData.length > 0 && (
                    <div className="table-footer">
                        <div className="table-pagination">
                            <Pagination
                                count={Math.ceil(returnedData.length / returnRowsPerPage)}
                                page={returnPage + 1}
                                onChange={(event, value) => setReturnPage(value - 1)}
                                variant="outlined"
                                shape="rounded"
                            />
                        </div>
                        <TablePagination
                            component="div"
                            count={returnedData.length}
                            page={returnPage}
                            onPageChange={(e, val) => setReturnPage(val)}
                            rowsPerPage={returnRowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setReturnRowsPerPage(parseInt(e.target.value, 10));
                                setReturnPage(0);
                            }}
                            nextIconButtonProps={{ style: { display: "none" } }}
                            backIconButtonProps={{ style: { display: "none" } }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NonciiOutwardDetail;
