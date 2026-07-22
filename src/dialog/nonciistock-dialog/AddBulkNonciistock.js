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
    Tooltip,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import DropdownField from "../../utils/DropDown";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import Progressbar from "../../utils/Progressbar";
import { postRequest } from "../../services/ApiService";
import { useUser } from "../../UserContext";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

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

const getFriendlyMessage = (rawMessage, success) => {
    if (success) return rawMessage;
    if (!rawMessage) return "Import failed due to an unknown error.";

    const msg = rawMessage.toLowerCase();
    if (msg.includes("unique key") || msg.includes("duplicate key")) {
        return "Duplicate entry — this record already exists.";
    }
    return rawMessage;
};

const AddBulkNonciistock = (props) => {
    const [open] = useState(props.value);
    const { name, fullName } = useUser();
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({ uploadType: "Bulk Upload" });
    const [view, setView] = useState("form");
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Results dialog state ---
    const [resultDialogOpen, setResultDialogOpen] = useState(false);
    const [importSummary, setImportSummary] = useState(null);

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            ReceivedBy: prevData.ReceivedBy || fullName || "",
        }));
    }, [fullName]);

    const { getRootProps, getInputProps } = useDropzone({
        accept: ".xls,.xlsx,.csv",
        maxSize: 25 * 1024 * 1024,
        onDrop: (acceptedFiles) => {
            setFiles(acceptedFiles);
            if (acceptedFiles[0]) {
                handleFileUpload(acceptedFiles[0]);
            }
        },
    });

    const handleClose = () => {
        props.handleOpenAddBulkMaterial();
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

    const handleBulkUpload = () => {
        if (isSubmitting) return;

        if (!files[0]) {
            ToastError("Please upload an Excel or CSV file.");
            return;
        }

        // Validate mandatory fields
        if (
            !formData.DeliveryNumber ||
            !formData.PoNumber ||
            !formData.Location ||
            !formData.InwardDate ||
            !(formData.ReceivedBy || fullName)
        ) {
            ToastError("Please enter all mandatory fields (PO Number, Delivery Number, Location, Inward Date, User)");
            return;
        }

        setIsSubmitting(true);

        const data = new FormData();
        data.append("file", files[0]);
        data.append("DeliveryNumber", formData.DeliveryNumber || "");
        data.append("OrderNumber", formData.OrderNumber || "");
        data.append("InwardDate", formData.InwardDate ? new Date(formData.InwardDate).toISOString() : "");
        data.append("InwardFrom", formData.InwardFrom || "");
        data.append("ReceivedBy", formData.ReceivedBy || fullName || "");
        data.append("RackLocation", formData.RackLocation || "");
        data.append("UserName", name);
        data.append("PoNumber", formData.PoNumber || "");
        data.append("Location", formData.Location || "");

        const url = `SmInboundStockNonCiis/BulkImportNonCII`;

        postRequest(url, data)
            .then((res) => {
                if (res.status === 200) {
                    const body = res.data;

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
                        // Fallback for the old { success, message } shape
                        ToastSuccess("Stock Added Successfully");
                        props.handleOpenAddBulkMaterial();
                    }
                }
            })
            .catch((error) => {
                ToastError(error.response?.data?.Message || error.response?.data || "Bulk upload failed. Please try again.");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleUploadClick = () => {
        setView("upload");
    };

    const handleCloseResultDialog = () => {
        setResultDialogOpen(false);
        props.handleOpenAddBulkMaterial();
    };

    const handleDownloadResults = () => {
        if (!importSummary || !importSummary.results?.length) return;

        const exportRows = importSummary.results.map((r) => ({
            "Row Number": r.rowNumber,
            "Material Number": r.materialNumber,
            "Status": r.success ? "Success" : "Failed",
            "Message": getFriendlyMessage(r.message, r.success),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        worksheet["!cols"] = [
            { wch: 10 },
            { wch: 18 },
            { wch: 10 },
            { wch: 60 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Import Results");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        XLSX.writeFile(workbook, `NonCIIBulkImportResults_${timestamp}.xlsx`);
    };

    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    <div className="dialog-title-contianer">
                        <div className="dialog-icon">
                            <Packageplus />
                        </div>
                        <Closebutton className="cursor" onClick={handleClose} />
                    </div>
                    <div className="dialog-title">Add Material Bulk Stock</div>
                    {view === "form" ? (
                        <DropdownField
                            label="Upload Type"
                            name="uploadType"
                            value={formData.uploadType || "Bulk Upload"}
                            placeholder="Select Upload Type"
                            onChange={handleInputChange}
                            options={["Bulk Upload"]}
                        />
                    ) : null}
                </DialogTitle>

                <DialogContent sx={{ padding: "0px 32px 40px 32px" }}>
                    {view === "form" ? (
                        <div className="grid-column">
                            <Textfield
                                label={<span>PO Number<span className="error">*</span></span>}
                                name="PoNumber"
                                value={formData.PoNumber || ""}
                                placeholder="Enter PO Number"
                                onChange={handleInputChange}
                            />
                            <Textfield
                                label={<span>Delivery Number<span className="error">*</span></span>}
                                name="DeliveryNumber"
                                value={formData.DeliveryNumber || ""}
                                placeholder="Enter Delivery Number"
                                onChange={handleInputChange}
                            />
                            <Textfield
                                label={<span>Order Number<span className="error">*</span></span>}
                                name="OrderNumber"
                                value={formData.OrderNumber || ""}
                                placeholder="Enter order number"
                                onChange={handleInputChange}
                            />
                            <Datefield
                                label={<span>Inward Date<span className="error">*</span></span>}
                                name="InwardDate"
                                value={formData.InwardDate || ""}
                                placeholder="Select Date"
                                onChange={handleInputChange}
                            />
                            <Textfield
                                label="Inward From"
                                name="InwardFrom"
                                value={formData.InwardFrom || ""}
                                placeholder="Enter source location"
                                onChange={handleInputChange}
                            />
                            <DropdownField
                                label={<span>Location<span className="error">*</span></span>}
                                name="Location"
                                value={formData.Location || ""}
                                placeholder="Select Location"
                                onChange={handleInputChange}
                                options={locationOptions}
                            />
                            <Textfield
                                label="Rack Location"
                                name="RackLocation"
                                value={formData.RackLocation || ""}
                                placeholder="Enter rack location"
                                onChange={handleInputChange}
                            />
                            <Textfield
                                label={<span>Received By<span className="error">*</span></span>}
                                name="ReceivedBy"
                                value={formData.ReceivedBy || fullName || ""}
                                placeholder="Enter receiver name"
                                onChange={handleInputChange}
                            />
                        </div>
                    ) : (
                        <div>
                            <div {...getRootProps()} className="fileupload-outer">
                                <input {...getInputProps()} />
                                <div className="product-title">
                                    <img className="w-10 h-10" src="/assets/images/upload.png" alt="Upload" />
                                </div>
                                <span className="fileupload-label">
                                    Drag and drop file here or <span className="fileupload-choosefile">Choose file</span>
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
                                            <span className="file-size">{(files[0].size / (1024 * 1024)).toFixed(2)} MB</span>
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
                                            <div className="fileupload-title">Upload ready. Submit to complete the bulk import.</div>
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
                            <button className="cancel-btn" onClick={handleAlert}>Cancel</button>
                            <button className="submit-btn" onClick={handleUploadClick}>Upload File</button>
                        </>
                    ) : (
                        <>
                            <button className="cancel-btn" onClick={() => setView("form")}>Back</button>
                            <button
                                className={`submit-btn ${files.length === 0 || uploadProgress !== 100 ? "disabled-btn" : ""}`}
                                disabled={isSubmitting || files.length === 0 || uploadProgress !== 100}
                                onClick={handleBulkUpload}
                            >
                                {isSubmitting ? "Uploading..." : "Submit"}
                            </button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* --- Import Results Dialog --- */}
            <Dialog open={resultDialogOpen} onClose={handleCloseResultDialog} maxWidth="md" fullWidth scroll="paper">
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
                        overflow: "hidden",
                    }}
                >
                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: "60vh",
                            overflow: "auto",
                            border: "1px solid rgba(0,0,0,0.08)",
                        }}
                    >
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                    <TableCell>Material Number</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Message</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {importSummary?.results.map((row) => (
                                    <TableRow
                                        key={`${row.rowNumber}-${row.materialNumber}`}
                                        sx={{
                                            backgroundColor: row.success
                                                ? "inherit"
                                                : "rgba(211, 47, 47, 0.08)",
                                        }}
                                    >
                                        <TableCell>{row.rowNumber}</TableCell>
                                        <TableCell>{row.materialNumber}</TableCell>
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

export default AddBulkNonciistock;