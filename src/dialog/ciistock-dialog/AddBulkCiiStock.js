import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
} from "@mui/material";
import { Tooltip } from "@mui/material";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import DropdownField from "../../utils/DropDown";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import Progressbar from "../../utils/Progressbar"
import { postRequest } from "../../services/ApiService";
import { useUser } from "../../UserContext";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const AddBulkCiiStock = (props) => {
    const [open] = useState(props.value);
    const { name, fullName } = useUser();
    const { materialNumber, materialDescription } = props;
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({uploadType: "Bulk Upload" });
    const [view, setView] = useState("form");
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Results dialog state ---
    const [resultDialogOpen, setResultDialogOpen] = useState(false);
    const [importSummary, setImportSummary] = useState(null); // { totalRows, successCount, failCount, results }

    useEffect(() => {
        setFormData({
            ...formData,
            ReceivedBy: fullName,
        });
    }, [fullName]);


    const { getRootProps, getInputProps } = useDropzone({
        accept: ".xls,.xlsx,.csv",
        maxSize: 25 * 1024 * 1024,
        onDrop: (acceptedFiles) => {
            console.log("Accepted files:", acceptedFiles);
            setFiles(acceptedFiles);
            handleFileUpload(acceptedFiles[0]);
        },
    });

    const handleClose = () => {
        props.handleOpenAddBulkMaterial();
        console.log(formData);
    };

    const handleAlert = () => {
        setShowAlert(prevState => !prevState);
    };

    const handleInputChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSingleAddStock = () => {
        if (!formData.serialNumber || !formData.quantity || !formData.status) {
            ToastError("Please enter Serial Number, Quantity, and Status");
            return;
        }
        let Data = {};
        Data = {
            ...Data,
            DeliveryNumber : formData.DeliveryNumber || "",
            MaterialNumber: materialNumber,
            MaterialDescription: materialDescription,
            OrderNumber: formData.OrderNumber,
            Inwarddate: formData.InwardDate ? new Date(formData.InwardDate).toLocaleDateString('en-CA') : null,
            ReceivedBy: formData.ReceivedBy || "",
            RacKLocation: formData.RackLocation || "",
            InwardFrom: formData.InwardFrom || "",  
            Username: name,
            serialNumber: formData.serialNumber || "",
            quantity: formData.quantity || "",
            status: formData.status 
        }

        const url = `SmInboundStockCiis/ImportSingleStockData`;

        postRequest(url, Data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Stock Added Successfully");
                    props.handleOpenAddBulkMaterial();
                }
            })
            .catch((error) => {
                ToastError(error.response.data);

            });
    }

    const handleBulkAddStock = () => {
        if (isSubmitting) return; // prevent double click

        if (!formData.Location) {
            ToastError("Please enter Location");
            return;
        }

        if (!files[0]) {
            ToastError("Please Upload Excel File");
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        data.append("file", files[0]); // Add the uploaded file
        data.append("DeliveryNumber", formData.DeliveryNumber || "");
        data.append("MaterialNumber", materialNumber);
        data.append("MaterialDescription", materialDescription);
        data.append("OrderNumber", formData.OrderNumber || "");
        data.append("Inwarddate", formData.InwardDate ? new Date(formData.InwardDate).toISOString() : "");
        data.append("ReceivedBy", formData.ReceivedBy || "");
        data.append("RacKLocation", formData.RackLocation || "");
        data.append("InwardFrom", formData.InwardFrom || "");  
        data.append("Username", name); 
        data.append("PoNumber", formData.PoNumber || "");
        data.append("Location", formData.Location || "");

        const url = `SmInboundStockCiis/AddBulkMaterialStock`;

        postRequest(url, data)
            .then((res) => {
                if (res.status === 200) {
                    const body = res.data;

                    // Support both a structured per-row response and a plain success message,
                    // in case the backend response shape differs across environments.
                    if (body && Array.isArray(body.results)) {
                        setImportSummary({
                            totalRows: body.totalRows ?? body.results.length,
                            successCount:
                                body.successCount ?? body.results.filter((r) => r.success).length,
                            failCount:
                                body.failCount ?? body.results.filter((r) => !r.success).length,
                            results: body.results,
                        });
                        setResultDialogOpen(true);

                        if (body.failCount > 0) {
                            ToastError(
                                `Imported with ${body.failCount} error(s). See details for row-level results.`
                            );
                        } else {
                            ToastSuccess("Stock Added Successfully");
                        }
                    } else {
                        ToastSuccess("Stock Added Successfully");
                        props.handleOpenAddBulkMaterial();
                    }
                }
            })
            .catch((error) => {
                ToastError(error.response?.data || "Bulk upload failed. Please try again.");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

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

    // Close results dialog, then close the parent bulk-upload dialog too
    const handleCloseResultDialog = () => {
        setResultDialogOpen(false);
        props.handleOpenAddBulkMaterial();
    };

    const handleDownloadResults = () => {
        if (!importSummary || !importSummary.results?.length) return;

        const exportRows = importSummary.results.map((r) => ({
            "Row Number": r.rowNumber,
            "Material Number": r.materialNumber,
            "Serial Number": r.serialNumber,
            "Status": r.success ? "Success" : "Failed",
            "Message": getFriendlyMessage(r.message, r.success),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        worksheet["!cols"] = [
            { wch: 10 },
            { wch: 18 },
            { wch: 16 },
            { wch: 10 },
            { wch: 60 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Import Results");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        XLSX.writeFile(workbook, `BulkStockImportResults_${timestamp}.xlsx`);
    };

    // Maps raw backend/SQL error messages to user-friendly text.
// Add more patterns here as you encounter other constraint/error types.
const getFriendlyMessage = (rawMessage, success) => {
    if (success) return rawMessage;
    if (!rawMessage) return "Import failed due to an unknown error.";

    const msg = rawMessage.toLowerCase();

    if (msg.includes("uq_serialnumber") || (msg.includes("unique key") && msg.includes("serial"))) {
        return "Serial Number already exists.";
    }
    if (msg.includes("unique key") || msg.includes("duplicate key")) {
        return "Duplicate entry — this record already exists.";
    }
    if (msg.includes("material number is missing")) {
        return "Material Number is missing.";
    }
    if (msg.includes("foreign key")) {
        return "This record references data that doesn't exist (invalid reference).";
    }
    if (msg.includes("truncat") || msg.includes("string or binary data would be truncated")) {
        return "One of the values is too long for its field.";
    }
    if (msg.includes("conversion failed") || msg.includes("invalid column")) {
        return "Invalid data format in one of the fields.";
    }

    // Fallback: don't show raw SQL/exception text to the user
    return "Import failed for this row. Please check the data and try again.";
};

    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    <div className="dialog-title">Add Material Bulk Stock </div>
                </DialogTitle>
                <DialogContent sx={{ padding: "0px 32px 40px 32px"}}>
                    {view === "form" ? (
                        <div className="grid-column">
                            <Textfield
                                label="Delivery Number"
                                name="DeliveryNumber"
                                value={formData.DeliveryNumber}
                                placeholder="Enter Delivery Number"
                                onChange={handleInputChange}
                            />
                            <Textfield
                                label="Order Number"
                                name="OrderNumber"
                                value={formData.OrderNumber}
                                placeholder="Enter order number"
                                onChange={handleInputChange}
                            />
                            <Textfield
                                label="Po Number"
                                name="PoNumber"
                                value={formData.PoNumber}
                                placeholder="Enter po number"
                                onChange={handleInputChange}
                            />
                            <Datefield
                                label="Inward Date"
                                name="InwardDate"
                                value={formData.InwardDate}
                                placeholder="Select Date"
                                onChange={handleInputChange}
                            />
                            <Textfield
                                label="Inward From"
                                name="InwardFrom"
                                value={formData.InwardFrom}
                                placeholder="Enter source location"
                                onChange={handleInputChange}
                            />
                            <Textfield
                                label="Received By"
                                name="ReceivedBy"
                                value={formData.ReceivedBy}
                                placeholder="Enter receiver name"
                                onChange={handleInputChange}
                            />
                            <Textfield
                                label="Rack Location"
                                name="RackLocation"
                                value={formData.RackLocation}
                                placeholder="Enter rack location"
                                onChange={handleInputChange}
                            />
                            <DropdownField
                                label={<span>Location<span className="error">*</span></span>}
                                name="Location"
                                value={formData.Location}
                                placeholder="Select Location"
                                onChange={handleInputChange}
                                options={["SIFI-Warehouse", "SIFI-Poststelle", "UT-CollectionPoint", "UT-ITPunktNeckartal", "SIFI-S2D", "Deizisau", "Transport"]}
                            />
                            {formData.uploadType && formData.uploadType !== "Bulk Upload" && (
                                <>
                                    <Textfield
                                        label={<span>Serial Number<span className="error">*</span></span>}
                                        name="serialNumber"
                                        value={formData.serialNumber}
                                        placeholder="Enter Serial Number"
                                        onChange={handleInputChange}
                                    />
                                    <Textfield
                                        label={<span>Quantity<span className="error">*</span></span>}
                                        name="quantity"
                                        value={formData.quantity}
                                        placeholder="Enter Quantity"
                                        onChange={handleInputChange}
                                    />
                                    <Textfield
                                        label={<span>Status<span className="error">*</span></span>}
                                        name="status"
                                        value={formData.status}
                                        placeholder="Enter Status"
                                        onChange={handleInputChange}
                                    />
                                </>
                            )}
                        </div>
                    ) : (
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
                                        <img className="w-8 h-8" src="/assets/images/excel.png" alt="Upload" />
                                            <span className="file-name">{files[0].name}</span>
                                            <span className="file-size">
                                                {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <Delete className="cursor" onClick={() => setFiles([])} />
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
                    {view === "form" ? (
                        <>
                            <button className="cancel-btn" onClick={handleAlert}>
                                Cancel
                            </button>
                                <button className="submit-btn" onClick={handleUploadClick}>
                                    Upload File
                                </button>
                        </>
                    ) : (
                        <>
                            <button className="cancel-btn" onClick={() => setView("form")}>
                                Back
                            </button>
                                <button
                                    className={`submit-btn ${files.length === 0 || uploadProgress !== 100 ? "disabled-btn" : ""}`}
                                    onClick={handleBulkAddStock} 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Uploading..." : "Submit"}
                                </button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* --- Import Results Dialog --- */}
            <Dialog
                open={resultDialogOpen}
                onClose={handleCloseResultDialog}
                maxWidth="md"
                fullWidth
                scroll="paper"
            >
                <DialogTitle>
                    <div className="dialog-title">Bulk Import Results</div>
                    {importSummary && (
                        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                            <Chip label={`Total: ${importSummary.totalRows}`} />
                            <Chip label={`Success: ${importSummary.successCount}`} color="success" />
                            <Chip label={`Failed: ${importSummary.failCount}`} color="error" />
                        </div>
                    )}
                </DialogTitle>
                <DialogContent
                    dividers
                    sx={{
                        padding: "16px 24px",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden", // let TableContainer own the scroll, not DialogContent
                    }}
                >
                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: "60vh",     // scales with viewport instead of a fixed 400px
                            overflow: "auto",
                            border: "1px solid rgba(0,0,0,0.08)",
                        }}
                    >
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                    <TableCell>Material Number</TableCell>
                                    <TableCell>Serial Number</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Message</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {importSummary?.results.map((row) => (
                                    <TableRow
                                        key={`${row.rowNumber}-${row.serialNumber}`}
                                        sx={{
                                            backgroundColor: row.success
                                                ? "inherit"
                                                : "rgba(211, 47, 47, 0.08)",
                                        }}
                                    >
                                        <TableCell>{row.rowNumber}</TableCell>
                                        <TableCell>{row.materialNumber}</TableCell>
                                        <TableCell>{row.serialNumber}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.success ? "Success" : "Failed"}
                                                color={row.success ? "success" : "error"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell style={{ whiteSpace: "pre-wrap" }}>
                                            <Tooltip title={row.message} arrow placement="top-start">
                                                <span>{getFriendlyMessage(row.message, row.success)}</span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ padding: "16px 24px" }}>
                    <button className="cancel-btn" onClick={handleDownloadResults}>
                        Download as Excel
                    </button>
                    <button className="submit-btn" onClick={handleCloseResultDialog}>
                        Close
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddBulkCiiStock;