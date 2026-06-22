import React, { useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import SaveAlert from "../SaveAlert";
import Progressbar from "../../utils/Progressbar";
import { postRequest } from "../../services/ApiService";
import { useUser } from "../../UserContext";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const AddBulkNonciistock = (props) => {
    const [open] = useState(props.value);
    const { name } = useUser();
    const [showAlert, setShowAlert] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        }, 200);
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

        setIsSubmitting(true);

        const data = new FormData();
        data.append("file", files[0]);
        data.append("username", name);

        const url = `SmInboundStockNonCiis/import`;

        postRequest(url, data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Bulk material upload completed successfully.");
                    props.handleOpenAddBulkMaterial();
                }
            })
            .catch((error) => {
                ToastError(error.response?.data || "Bulk upload failed. Please try again.");
                setIsSubmitting(false);
            });
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
                    <div className="dialog-title">Bulk Upload Non-CII Materials</div>
                </DialogTitle>

                <DialogContent sx={{ padding: "0px 32px 40px 32px" }}>
                    <div {...getRootProps()} className="fileupload-outer">
                        <input {...getInputProps()} />
                        <div className="product-title">
                            <img className="w-10 h-10" src="/assets/images/upload.png" alt="Upload" />
                        </div>
                        <span className="fileupload-label">
                            Drag and drop your file here or <span className="fileupload-choosefile">Choose file</span>
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
                                    <button className="viewfile-btn" onClick={handleViewFile}>
                                        View File
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>

                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button
                        className={`submit-btn ${!files[0] || uploadProgress !== 100 ? "disabled-btn" : ""}`}
                        disabled={isSubmitting || !files[0] || uploadProgress !== 100}
                        onClick={handleBulkUpload}
                    >
                        Submit
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddBulkNonciistock;
