import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import { useLocation } from "react-router-dom";
import DropdownField from "../../utils/DropDown";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import Progressbar from "../../utils/Progressbar";
import { postRequest } from "../../services/ApiService";
import { useUser } from "../../UserContext";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const emptyRow = {
    inwardDate: "",
    deliveryNumber: "",
    orderNumber: "",
    enterQuantity: "",
    inwardFrom: "",
    location: "",
    rackLocation: "",
    receivedBy: "",
    status: "",
};

const AddStockInward = (props) => {
    const location = useLocation();
    const { name, fullName } = useUser();
    const { materialDescription } = props;
    const materialNumber = location.pathname.split('/').pop();
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({ uploadType: "Bulk Upload" });
    const [bulkRows, setBulkRows] = useState([{ ...emptyRow, receivedBy: "" }]);
    const [view, setView] = useState("form");
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const locationOptions = [
        "SIFI-Warehouse",
        "SIFI-Poststelle",
        "UT-CollectionPoint",
        "UT-ITPunktNeckartal",
        "SIFI-S2D",
        "Deizisau",
        "Transport",
    ];

    const statusOptions = ["New", "Used", "Transport"];

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            receivedBy: fullName,
        }));
        setBulkRows((prev) =>
            prev.map((row) => ({
                ...row,
                receivedBy: row.receivedBy || fullName,
            }))
        );
    }, [fullName]);

    const { getRootProps, getInputProps } = useDropzone({
        accept: ".xls,.xlsx,.csv",
        maxSize: 25 * 1024 * 1024,
        onDrop: (acceptedFiles) => {
            console.log("Accepted files:", acceptedFiles);
            setFiles(acceptedFiles);
            if (acceptedFiles[0]) {
                handleFileUpload(acceptedFiles[0]);
            }
        },
    });

    const handleClose = () => {
        props.handleOpenAddStock();
        console.log(formData);
    };

    const handleAlert = () => {
        setShowAlert((prevState) => !prevState);
    };

    const handleInputChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // --- Bulk rows handlers ---
    const handleBulkRowChange = (index, fieldName, value) => {
        setBulkRows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [fieldName]: value };
            return updated;
        });
    };

    const handleAddRow = () => {
        setBulkRows((prev) => [...prev, { ...emptyRow, receivedBy: fullName }]);
    };

    const handleRemoveRow = (index) => {
        setBulkRows((prev) => {
            if (prev.length <= 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
    };

    const isBulkRowValid = (row) => {
        return row.deliveryNumber && row.enterQuantity && row.location && row.receivedBy && row.status;
    };

    const isAnyBulkRowValid = bulkRows.some(isBulkRowValid);

    // --- Single upload submit ---
    const handleSingleAddStock = () => {
        if (isSubmitting) return;

        if (!formData.deliveryNumber || !formData.enterQuantity || !formData.location || !formData.receivedBy || !formData.status) {
            ToastError("Please enter all mandatory fields (PO Number, Quantity, Location, User, Status)");
            return;
        }

        setIsSubmitting(true);
        let Data = {};
        Data = {
            ...Data,
            materialNumber: materialNumber,
            materialDescription: materialDescription,
            deliveryNumber: formData.deliveryNumber,
            orderNumber: formData.orderNumber || "",
            inwardDate: formData.inwardDate ? new Date(formData.inwardDate).toLocaleDateString('en-CA') : null,
            inwardFrom: formData.inwardFrom || "",
            quantityReceived: formData.enterQuantity,
            location: formData.location || "",
            receivedBy: formData.receivedBy || "",
            rackLocation: formData.rackLocation || "",
            status: formData.status || "",
            username: name,
        };

        const url = `SmInboundStockNonCiis/AddNonStockInbounddata`;

        postRequest(url, Data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Stock Added Successfully");
                    props.handleOpenAddStock();
                }
            })
            .catch((error) => {
                ToastError(error.response.data);
                setIsSubmitting(false);
            });
    };

    // --- Bulk manual rows submit ---
    const handleBulkManualSubmit = () => {
        if (isSubmitting) return;

        const validRows = bulkRows.filter(isBulkRowValid);
        if (validRows.length === 0) {
            ToastError("Please fill all mandatory fields in at least one row");
            return;
        }

        setIsSubmitting(true);

        const payload = validRows.map((row) => ({
            materialNumber: materialNumber,
            materialDescription: materialDescription,
            deliveryNumber: row.deliveryNumber,
            orderNumber: row.orderNumber || "",
            inwardDate: row.inwardDate ? new Date(row.inwardDate).toLocaleDateString('en-CA') : null,
            inwardFrom: row.inwardFrom || "",
            quantityReceived: row.enterQuantity,
            location: row.location || "",
            receivedBy: row.receivedBy || "",
            rackLocation: row.rackLocation || "",
            status: row.status || "",
            username: name,
        }));

        const url = `SmInboundStockNonCiis/AddNonStockInbounddataBulk`;

        postRequest(url, payload)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Bulk Stock Added Successfully");
                    props.handleOpenAddStock();
                }
            })
            .catch((error) => {
                ToastError(error.response?.data || "Bulk submit failed. Please try again.");
                setIsSubmitting(false);
            });
    };

    // --- Bulk file upload submit ---
    const handleBulkFileSubmit = () => {
        if (isSubmitting) return;

        if (!files[0]) {
            ToastError("Please Upload Excel File");
            return;
        }

        setIsSubmitting(true);

        const data = new FormData();
        data.append("file", files[0]);
        data.append("MaterialNumber", materialNumber);
        data.append("MaterialDescription", materialDescription);
        data.append("Username", name);

        const url = `SmInboundStockNonCiis/import`;

        postRequest(url, data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Stock Added Successfully");
                    props.handleOpenAddStock();
                }
            })
            .catch((error) => {
                ToastError(error.response?.data || "Bulk upload failed. Please try again.");
                setIsSubmitting(false);
            });
    };

    const handleUploadClick = () => {
        setView("upload");
    };

    const handleFileUpload = (file) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setUploadedFile(file);
                setUploadProgress(100);
            }
        }, 300);
    };

    const handleViewFile = () => {
        if (uploadedFile) {
            const fileURL = URL.createObjectURL(uploadedFile);
            window.open(fileURL, "_blank");
        }
    };

    // Helper to render a single bulk row form
    const renderBulkRow = (row, index) => (
        <div key={index} style={{ border: "1px solid #E0E0E0", borderRadius: "8px", padding: "16px", marginBottom: "12px", position: "relative", backgroundColor: index % 2 === 0 ? "#FAFAFA" : "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: 600, fontSize: "14px", color: "#344054" }}>Entry {index + 1}</span>
                {bulkRows.length > 1 && (
                    <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#D92D20" }}
                        title="Remove this entry"
                    >
                        <Delete style={{ width: "18px", height: "18px" }} />
                    </button>
                )}
            </div>
            <div className="grid-column">
                <Datefield
                    name="inwardDate"
                    label="Date"
                    placeholder="Select Date"
                    onChange={(n, v) => handleBulkRowChange(index, n, v)}
                    value={row.inwardDate}
                />
                <Textfield
                    name="deliveryNumber"
                    label={<span>PO Number<span className="error">*</span></span>}
                    placeholder="Enter PO Number"
                    onChange={(n, v) => handleBulkRowChange(index, n, v)}
                    value={row.deliveryNumber}
                />
                <Textfield
                    name="orderNumber"
                    label="Order Number"
                    placeholder="Enter Order Number"
                    onChange={(n, v) => handleBulkRowChange(index, n, v)}
                    value={row.orderNumber}
                />
                <Textfield
                    name="enterQuantity"
                    label={<span>Quantity<span className="error">*</span></span>}
                    placeholder="Enter Quantity"
                    onChange={(n, v) => handleBulkRowChange(index, n, v)}
                    value={row.enterQuantity}
                />
                <Textfield
                    name="inwardFrom"
                    label="Inward From"
                    placeholder="Enter source"
                    onChange={(n, v) => handleBulkRowChange(index, n, v)}
                    value={row.inwardFrom}
                />
                <DropdownField
                    name="location"
                    label={<span>Location<span className="error">*</span></span>}
                    placeholder="Select Location"
                    onChange={(n, v) => handleBulkRowChange(index, n, v)}
                    value={row.location}
                    options={locationOptions}
                />
                <Textfield
                    name="rackLocation"
                    label="Rack Location"
                    placeholder="Enter Rack Location"
                    onChange={(n, v) => handleBulkRowChange(index, n, v)}
                    value={row.rackLocation}
                />
                <Textfield
                    name="receivedBy"
                    label={<span>User<span className="error">*</span></span>}
                    placeholder="Enter user name"
                    onChange={(n, v) => handleBulkRowChange(index, n, v)}
                    value={row.receivedBy}
                />
                <DropdownField
                    name="status"
                    label={<span>Status<span className="error">*</span></span>}
                    placeholder="Select Status"
                    onChange={(n, v) => handleBulkRowChange(index, n, v)}
                    value={row.status}
                    options={statusOptions}
                />
            </div>
        </div>
    );

    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    <div className="dialog-title">Add Stock Inward</div>
                    {view === "form" ? (
                        <DropdownField
                            label="Upload Type"
                            name="uploadType"
                            value={formData.uploadType || "Bulk Upload"}
                            placeholder="Select Upload Type"
                            onChange={handleInputChange}
                            options={["Single Upload", "Bulk Upload"]}
                        />
                    ) : ""}
                </DialogTitle>
                <DialogContent sx={{ padding: "0px 32px 40px 32px" }}>
                    <div className="addstock-details">
                        <div className="detail-item">
                            <span className="detail-label">Material Number</span>
                            <span className="detail-description">{materialNumber}</span>
                        </div>
                        <span className="divider h-12 w-0.5 bg-[#6B7379] mx-2"></span>
                        <div className="detail-item">
                            <span className="detail-label">Material Description</span>
                            <span className="detail-description">
                                {materialDescription}
                            </span>
                        </div>
                    </div>

                    {/* === SINGLE UPLOAD VIEW === */}
                    {view === "form" && formData.uploadType === "Single Upload" && (
                        <div className="grid-column">
                            <Datefield
                                name="inwardDate"
                                label="Date"
                                placeholder="Select Date"
                                onChange={handleInputChange}
                                value={formData.inwardDate}
                            />
                            <Textfield
                                name="deliveryNumber"
                                label={<span>PO Number<span className="error">*</span></span>}
                                placeholder="Enter PO Number"
                                onChange={handleInputChange}
                                value={formData.deliveryNumber}
                            />
                            <Textfield
                                name="orderNumber"
                                label="Order Number"
                                placeholder="Enter Order Number"
                                onChange={handleInputChange}
                                value={formData.orderNumber}
                            />
                            <Textfield
                                name="enterQuantity"
                                label={<span>Quantity<span className="error">*</span></span>}
                                placeholder="Enter Quantity"
                                onChange={handleInputChange}
                                value={formData.enterQuantity}
                            />
                            <Textfield
                                name="inwardFrom"
                                label="Inward From"
                                placeholder="Enter source"
                                onChange={handleInputChange}
                                value={formData.inwardFrom}
                            />
                            <DropdownField
                                name="location"
                                label={<span>Location<span className="error">*</span></span>}
                                placeholder="Select Location"
                                onChange={handleInputChange}
                                value={formData.location}
                                options={locationOptions}
                            />
                            <Textfield
                                name="rackLocation"
                                label="Rack Location"
                                placeholder="Enter Rack Location"
                                onChange={handleInputChange}
                                value={formData.rackLocation}
                            />
                            <Textfield
                                name="receivedBy"
                                label={<span>User<span className="error">*</span></span>}
                                placeholder="Enter user name"
                                onChange={handleInputChange}
                                value={formData.receivedBy}
                            />
                            <DropdownField
                                name="status"
                                label={<span>Status<span className="error">*</span></span>}
                                placeholder="Select Status"
                                onChange={handleInputChange}
                                value={formData.status}
                                options={statusOptions}
                            />
                        </div>
                    )}

                    {/* === BULK UPLOAD VIEW (Manual Rows + Add More) === */}
                    {view === "form" && formData.uploadType === "Bulk Upload" && (
                        <div>
                            <div style={{ maxHeight: "450px", overflowY: "auto", paddingRight: "4px" }}>
                                {bulkRows.map((row, index) => renderBulkRow(row, index))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "end", alignItems: "center", marginTop: "12px" }}>
                                {/* <button
                                    type="button"
                                    className="outer-firstsection-add"
                                    onClick={handleAddRow}
                                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                >
                                    <Plus /> Add Another Entry
                                </button> */}
                                <button
                                    type="button"
                                    className="submit-btn"
                                    onClick={handleUploadClick}
                                    style={{ fontSize: "13px" }}
                                >
                                    Upload File
                                </button>
                            </div>
                        </div>
                    )}

                    {/* === FILE UPLOAD VIEW === */}
                    {view === "upload" && (
                        <div>
                            <div {...getRootProps()} className="fileupload-outer">
                                <input {...getInputProps()} />
                                <div className="product-title">
                                    <img className="w-10 h-10" src="/assets/images/upload.png" alt="Upload" />
                                </div>
                                <span className="fileupload-label">
                                    Drag and Drop file here or{" "}
                                    <span className="fileupload-choosefile">Choose file</span>
                                    <span className="error">*</span>
                                </span>
                            </div>
                            <div className="fileupload-description">
                                <span>Support formats: XLS, XLSX, CSV</span>
                                <span>Maximum size: 25MB</span>
                            </div>
                            {files.length > 0 && (
                                <div className="fileupload-details-container">
                                    <div className="fileupload-excel-section">
                                        <div className="file-info">
                                            <img className="w-8 h-8" src="/assets/images/excel.png" alt="Excel file" />
                                            <span className="file-name">{files[0].name}</span>
                                            <span className="file-size">
                                                {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <Delete className="cursor" onClick={() => {
                                            setFiles([]);
                                            setUploadProgress(0);
                                            setUploadedFile(null);
                                        }} />
                                    </div>
                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="progress-bar-container">
                                            <Progressbar value={uploadProgress} />
                                        </div>
                                    )}
                                    {uploadProgress === 100 && (
                                        <div className="fileupload-complete">
                                            <div className="fileupload-title">You can view the attached example and use it as a reference to create your own file.</div>
                                            <button className="viewfile-btn" onClick={handleViewFile}>View File</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    {view === "form" && formData.uploadType === "Single Upload" && (
                        <>
                            <button className="cancel-btn" onClick={handleAlert}>
                                Cancel
                            </button>
                            <button className="submit-btn" onClick={handleSingleAddStock} disabled={isSubmitting}>
                                Submit
                            </button>
                        </>
                    )}
                    {view === "form" && formData.uploadType === "Bulk Upload" && (
                        <>
                            <button className="cancel-btn" onClick={handleAlert}>
                                Cancel
                            </button>
                            <button
                                className={`submit-btn ${!isAnyBulkRowValid ? "disabled-btn" : ""}`}
                                onClick={handleBulkManualSubmit}
                                disabled={isSubmitting || !isAnyBulkRowValid}
                            >
                                Submit
                            </button>
                        </>
                    )}
                    {view === "upload" && (
                        <>
                            <button className="cancel-btn" onClick={() => setView("form")}>
                                Back
                            </button>
                            <button
                                className={`submit-btn ${files.length === 0 || uploadProgress !== 100 ? "disabled-btn" : ""}`}
                                disabled={isSubmitting || files.length === 0 || uploadProgress !== 100}
                                onClick={handleBulkFileSubmit}
                            >
                                Submit
                            </button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddStockInward;
