import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Search from "../utils/Search";
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
import { CircularProgress } from "@mui/material";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Undo2,
    Trash2,
    Package,
    Bell,
    CheckCheck,
    Check,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRequest, postRequest, getApiErrorMessage } from "../services/ApiService";
import { ToastError, ToastSuccess } from "../services/ToastMsg";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const TABS = [
    { key: "all", label: "View all" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
];

const TYPE_FILTERS = [
    { key: "", label: "All types" },
    { key: "StockInward", label: "Inward" },
    { key: "StockOutward", label: "Outward" },
    { key: "StockReturn", label: "Returns" },
    { key: "StockDeleted", label: "Deletions" },
    { key: "Material", label: "Material" },
    { key: "System", label: "System" },
];

// Icon per notification type, sized to sit on the 14px table row.
const TYPE_ICON = {
    StockInward: <ArrowDownToLine size={16} />,
    StockOutward: <ArrowUpFromLine size={16} />,
    StockReturn: <Undo2 size={16} />,
    StockDeleted: <Trash2 size={16} />,
    Material: <Package size={16} />,
    System: <Bell size={16} />,
};

// Reuses the existing status-pill palette so notifications look native to the app.
const severityClass = (severity) => {
    switch (severity) {
        case "Success":
            return "status-available";
        case "Warning":
        case "Critical":
            return "status-not-available";
        default:
            return "outer-firstsection-subtitle";
    }
};

const Notification = () => {
    const navigate = useNavigate();
    const breadcrumbData = [{ label: "Notification", path: "" }];

    const [items, setItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const [activeTab, setActiveTab] = useState("all");
    const [typeFilter, setTypeFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const query = useMemo(
        () => ({
            status: activeTab,
            type: typeFilter,
            search: searchQuery,
            page: currentPage + 1,
            pageSize: rowsPerPage,
        }),
        [activeTab, typeFilter, searchQuery, currentPage, rowsPerPage]
    );

    const fetchNotifications = useCallback(() => {
        setLoading(true);

        const params = new URLSearchParams({
            status: query.status,
            page: String(query.page),
            pageSize: String(query.pageSize),
        });
        if (query.type) params.append("type", query.type);
        if (query.search) params.append("search", query.search);

        getRequest(`Notifications?${params.toString()}`)
            .then((res) => {
                if (res.status === 200) {
                    setItems(res.data?.items || []);
                    setTotalCount(res.data?.totalCount || 0);
                    setUnreadCount(res.data?.unreadCount || 0);
                }
            })
            .catch((error) => {
                ToastError(getApiErrorMessage(error, "Could not load notifications."));
            })
            .finally(() => setLoading(false));
    }, [query]);

    // Debounced so typing in the search box does not fire a request per keystroke.
    useEffect(() => {
        const timer = setTimeout(fetchNotifications, 250);
        return () => clearTimeout(timer);
    }, [fetchNotifications]);

    const handleSearch = (value) => {
        setSearchQuery(value);
        setCurrentPage(0);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setCurrentPage(0);
    };

    const handleTypeChange = (key) => {
        setTypeFilter(key);
        setCurrentPage(0);
    };

    const handleMarkAsRead = (item) => {
        if (item.isRead) return;

        setBusyId(item.id);
        postRequest(`Notifications/${item.id}/read`)
            .then(() => {
                // Update in place rather than refetching - the row stays put and the
                // badge stays honest.
                setItems((previous) =>
                    previous.map((row) => (row.id === item.id ? { ...row, isRead: true } : row))
                );
                setUnreadCount((previous) => Math.max(0, previous - 1));
            })
            .catch((error) => ToastError(getApiErrorMessage(error, "Could not mark the notification as read.")))
            .finally(() => setBusyId(null));
    };

    const handleMarkAllAsRead = () => {
        if (unreadCount === 0) return;

        postRequest("Notifications/read-all")
            .then((res) => {
                ToastSuccess(res.message || "All notifications marked as read.");
                fetchNotifications();
            })
            .catch((error) => ToastError(getApiErrorMessage(error, "Could not mark notifications as read.")));
    };

    const handleDismiss = (item) => {
        setBusyId(item.id);
        postRequest(`Notifications/${item.id}/dismiss`)
            .then(() => fetchNotifications())
            .catch((error) => ToastError(getApiErrorMessage(error, "Could not dismiss the notification.")))
            .finally(() => setBusyId(null));
    };

    const handleClearAll = () => {
        if (totalCount === 0) return;

        postRequest("Notifications/clear")
            .then((res) => {
                ToastSuccess(res.message || "All notifications cleared.");
                setCurrentPage(0);
                fetchNotifications();
            })
            .catch((error) => ToastError(getApiErrorMessage(error, "Could not clear notifications.")));
    };

    // Deep-link to whatever the notification is about, when we can work it out.
    const handleRowClick = (item) => {
        handleMarkAsRead(item);

        if (!item.materialNumber) return;

        if (item.referenceType?.startsWith("NonCii")) {
            navigate(`/non-cii-stock/${item.materialNumber}`);
        } else if (item.referenceType?.startsWith("Cii")) {
            navigate(`/cii-stock/${item.materialNumber}`);
        }
    };

    const formatDateTime = (value) => {
        if (!value) return "";

        // The API sends UTC; append the marker when it is missing so the browser
        // converts to local time instead of assuming local.
        const normalised = /[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
        const date = new Date(normalised);
        if (isNaN(date.getTime())) return "";

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const relativeTime = (value) => {
        if (!value) return "";
        const normalised = /[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
        const seconds = Math.floor((Date.now() - new Date(normalised).getTime()) / 1000);

        if (isNaN(seconds) || seconds < 0) return "";
        if (seconds < 60) return "just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return "";
    };

    return (
        <div>
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <span className="main-title">Notification</span>

                <div className="outer-firstsection">
                    <div className="outer-firstsection-header">
                        <span className="outer-firstsection-title">Notifications</span>
                        <span className="outer-firstsection-subtitle">{unreadCount} Unread</span>
                    </div>
                    <div className="outer-firstsection-actions">
                        <button
                            className="outer-firstsection-download"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                            style={unreadCount === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                        >
                            <CheckCheck size={16} /> Mark all as read
                        </button>
                        <button
                            className="outer-firstsection-download"
                            onClick={handleClearAll}
                            disabled={totalCount === 0}
                            style={totalCount === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                        >
                            <Trash2 size={16} /> Clear all
                        </button>
                    </div>
                </div>

                <div className="outer-secondsection">
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <div className="tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
                                    onClick={() => handleTabChange(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="tabs">
                            {TYPE_FILTERS.map((filter) => (
                                <button
                                    key={filter.key || "all-types"}
                                    className={`tab-button ${typeFilter === filter.key ? "active" : ""}`}
                                    onClick={() => handleTypeChange(filter.key)}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Search placeholder="Search notifications" onChange={handleSearch} />
                </div>

                <div className="div-table">
                    <div className="div-head">
                        <div className="table-header text-left w-[4%]" />
                        <div className="table-header text-left w-[14%]">Type</div>
                        <div className="table-header text-left w-[34%]">Notification</div>
                        <div className="table-header text-left w-[13%]">Material</div>
                        <div className="table-header text-left w-[12%]">Serial Number</div>
                        <div className="table-header text-left w-[12%]">Raised By</div>
                        <div className="table-header text-left w-[15%]">Date</div>
                        <div className="table-header text-center w-[10%]">Actions</div>
                    </div>

                    <div className="max-h-[480px] overflow-y-auto overflow-x-auto">
                        {loading && (
                            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                                <CircularProgress size={28} />
                            </div>
                        )}

                        {!loading && items.length === 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "56px 0",
                                    color: "#6B7379",
                                }}
                            >
                                <Bell size={28} />
                                <span style={{ fontSize: "14px", lineHeight: "20px" }}>
                                    {searchQuery || typeFilter || activeTab !== "all"
                                        ? "No notifications match this filter."
                                        : "You're all caught up. Nothing to show yet."}
                                </span>
                            </div>
                        )}

                        {!loading &&
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className="div-data"
                                    style={{
                                        backgroundColor: item.isRead ? "#FFFFFF" : "#F9FAFB",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleRowClick(item)}
                                >
                                    <div className="table-data text-left w-[4%]">
                                        {/* Unread marker: a dot rather than bold text, so row height never shifts. */}
                                        {!item.isRead && (
                                            <span
                                                title="Unread"
                                                style={{
                                                    display: "inline-block",
                                                    width: "8px",
                                                    height: "8px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "#0000EE",
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="table-data text-left w-[14%]">
                                        <span
                                            className={severityClass(item.severity)}
                                            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                                        >
                                            {TYPE_ICON[item.notificationType] || TYPE_ICON.System}
                                            {item.notificationType?.replace("Stock", "") || "System"}
                                        </span>
                                    </div>

                                    <div className="table-data text-left w-[34%]" style={{ whiteSpace: "normal" }}>
                                        <div style={{ fontWeight: item.isRead ? 400 : 600 }}>{item.title}</div>
                                        <div style={{ color: "#6B7379", fontSize: "13px", lineHeight: "18px" }}>
                                            {item.message}
                                        </div>
                                    </div>

                                    <div className="table-data text-left w-[13%]">
                                        {item.materialNumber ? (
                                            <span className="text-hyper">{item.materialNumber}</span>
                                        ) : (
                                            "-"
                                        )}
                                    </div>
                                    <div className="table-data text-left w-[12%]">{item.serialNumber || "-"}</div>
                                    <div className="table-data text-left w-[12%]">{item.createdByUser || "-"}</div>

                                    <div className="table-data text-left w-[15%]">
                                        <div>{formatDateTime(item.createdAtUtc)}</div>
                                        <div style={{ color: "#6B7379", fontSize: "12px", lineHeight: "18px" }}>
                                            {relativeTime(item.createdAtUtc)}
                                        </div>
                                    </div>

                                    <div
                                        className="table-data text-center w-[10%]"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                            {!item.isRead && (
                                                <button
                                                    title="Mark as read"
                                                    className="cursor"
                                                    disabled={busyId === item.id}
                                                    onClick={() => handleMarkAsRead(item)}
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button
                                                title="Dismiss"
                                                className="cursor"
                                                disabled={busyId === item.id}
                                                onClick={() => handleDismiss(item)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="table-footer">
                    <div className="table-pagination">
                        <Pagination
                            count={Math.max(1, Math.ceil(totalCount / rowsPerPage))}
                            page={currentPage + 1}
                            onChange={(event, value) => setCurrentPage(value - 1)}
                            variant="outlined"
                            shape="rounded"
                        />
                    </div>
                    <TablePagination
                        component="div"
                        count={totalCount}
                        page={currentPage}
                        onPageChange={(event, value) => setCurrentPage(value)}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setCurrentPage(0);
                        }}
                        nextIconButtonProps={{ style: { display: "none" } }}
                        backIconButtonProps={{ style: { display: "none" } }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Notification;
