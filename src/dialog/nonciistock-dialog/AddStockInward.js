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

const AddStockInward = (props) => {
    const location = useLocation();
    const { name, fullName } = useUser();
    const { materialDescription } = props;
    const materialNumber = location.pathname.split('/').pop();
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({ uploadType: "Bulk Upload" });
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

    // --- Single upload submit ---
    const handleSingleAddStock = () => {
        if (isSubmitting) return;

        if (!formData.deliveryNumber || !formData.enterQuantity || !formData.location || !formData.receivedBy || !formData.status) {
            ToastError("Please enter all mandatory fields (Delivery Number, Quantity, Location, ReceivedBy, Status)");
            return;
        }

        setIsSubmitting(true);

        const Data = {
            materialNumber: materialNumber,
            materialDescription: materialDescription,
            deliveryNumber: formData.deliveryNumber,
            orderNumber: formData.orderNumber || "",
            poNumber: formData.poNumber || "",
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

    // --- Bulk file upload submit ---
    const handleBulkAddStock = () => {
        if (isSubmitting) return;

        if (!formData.location) {
            ToastError("Please enter Location");
            return;
        }

        if (!files[0]) {
            ToastError("Please Upload Excel File");
            return;
        }

        setIsSubmitting(true);

        const data = new FormData();
        data.append("file", files[0]);
        data.append("MaterialNumber", materialNumber);
        data.append("MaterialDescription", materialDescription);
        data.append("DeliveryNumber", formData.deliveryNumber || "");
        data.append("OrderNumber", formData.orderNumber || "");
        data.append("PoNumber", formData.poNumber || "");
        data.append("InwardDate", formData.inwardDate ? new Date(formData.inwardDate).toLocaleDateString('en-CA') : "");
        data.append("InwardFrom", formData.inwardFrom || "");
        data.append("QuantityReceived", formData.enterQuantity || "");
        data.append("Location", formData.location || "");
        data.append("ReceivedBy", formData.receivedBy || "");
        data.append("RackLocation", formData.rackLocation || "");
        data.append("Status", formData.status || "");
        data.append("Username", name);

        const url = `SmInboundStockNonCiis/BulkImportNonCII`;

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
            if (progress === 100) {
                clearInterval(interval);
                setUploadedFile(file);
            }
        }, 300);
    };

    const handleViewFile = () => {
        if (uploadedFile) {
            const fileURL = URL.createObjectURL(uploadedFile);
            window.open(fileURL, "_blank");
        }
    };

    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    <div className="dialog-title">Add Stock Inward</div>
                    {/* {view === "form" ? (
                        <DropdownField
                            label="Upload Type"
                            name="uploadType"
                            value={formData.uploadType || "Bulk Upload"}
                            placeholder="Select Upload Type"
                            onChange={handleInputChange}
                            options={["Single Upload", "Bulk Upload"]}
                        />
                    ) : ""} */}
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
                            <span className="detail-description">{materialDescription}</span>
                        </div>
                    </div>

                    {/* === FORM VIEW (Single & Bulk share the same common fields) === */}
                    {/* {view === "form" && ( */}
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
                                label={<span>Delivery Number<span className="error">*</span></span>}
                                placeholder="Enter Delivery Number"
                                onChange={handleInputChange}
                                value={formData.deliveryNumber}
                            />
                            <Textfield
                                name="poNumber"
                                label="PO Number"
                                placeholder="Enter PO Number"
                                onChange={handleInputChange}
                                value={formData.poNumber}
                            />
                            <Textfield
                                name="orderNumber"
                                label="Order Number"
                                placeholder="Enter Order Number"
                                onChange={handleInputChange}
                                value={formData.orderNumber}
                            />
                            <Textfield
                                name="inwardFrom"
                                label="Inward From"
                                placeholder="Enter source"
                                onChange={handleInputChange}
                                value={formData.inwardFrom}
                            />
                            <Textfield
                                name="receivedBy"
                                label={<span>ReceivedBy<span className="error">*</span></span>}
                                placeholder="Enter user name"
                                onChange={handleInputChange}
                                value={formData.receivedBy}
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

                            {/* Single Upload only: Quantity and Status */}
                            {/* {formData.uploadType && formData.uploadType !== "Bulk Upload" && ( */}
                                <>
                                    <Textfield
                                        name="enterQuantity"
                                        label={<span>Quantity<span className="error">*</span></span>}
                                        placeholder="Enter Quantity"
                                        onChange={handleInputChange}
                                        value={formData.enterQuantity}
                                    />
                                    <DropdownField
                                        name="status"
                                        label={<span>Status<span className="error">*</span></span>}
                                        placeholder="Select Status"
                                        onChange={handleInputChange}
                                        value={formData.status}
                                        options={statusOptions}
                                    />
                                </>
                            {/* )} */}
                        </div>
                    {/* )} */}

                    {/* === FILE UPLOAD VIEW === */}
                    {/* {view === "upload" && (
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
                    )} */}
                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleSingleAddStock} disabled={isSubmitting}>
                        Submit
                    </button>        
                    {/* {view === "form" ? (
                        <>
                            <button className="cancel-btn" onClick={handleAlert}>
                                Cancel
                            </button>
                            {formData.uploadType === "Single Upload" ? (
                                <button className="submit-btn" onClick={handleSingleAddStock} disabled={isSubmitting}>
                                    Submit
                                </button>
                            ) : formData.uploadType === "Bulk Upload" ? (
                                <button className="submit-btn" onClick={handleUploadClick}>
                                    Upload File
                                </button>
                            ) : null}
                        </>
                    ) : (
                        <>
                            <button className="cancel-btn" onClick={() => setView("form")}>
                                Back
                            </button>
                            <button
                                className={`submit-btn ${files.length === 0 || uploadProgress !== 100 ? "disabled-btn" : ""}`}
                                disabled={isSubmitting || files.length === 0 || uploadProgress !== 100}
                                onClick={handleBulkAddStock}
                            >
                                Submit
                            </button>
                        </>
                    )} */}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddStockInward;