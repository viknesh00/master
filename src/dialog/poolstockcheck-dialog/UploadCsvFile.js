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
import DropdownField from "../../utils/DropDown";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import Progressbar from "../../utils/Progressbar"
import { postRequest } from "../../services/ApiService";
import { useUser } from "../../UserContext";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";
import * as XLSX from "xlsx";
import PoolStockCheck from '../../pages/PoolStockCheck';

const UploadCsvFile = (props) => {
    
    const [open] = useState(props.value);
    const {setRecordMatched} = props;
    const { name } = useUser();
    const { materialNumber, materialDescription } = props;
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({uploadType: "Bulk Upload"});
    const [view, setView] = useState("form");
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [matchedRows, setMatchedRows] = useState([]);

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
        props.handleOpenUploadStock();
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

    const handleUploadClick = () => {
        setView("upload");
    };

    const handleSubmit = () => {
        debugger
                if(!files[0]){
                    ToastError("Please Upload Excel File");
                }
                const data = new FormData();
                data.append("file", files[0]); // Add the uploaded file
                data.append("Username", name); 
        
                const url = `SmInboundStockCiis/compare`;
        
                postRequest(url, data)
                    .then((res) => {
                        if (res.status === 200) {
                            ToastSuccess("Stock Compared Successfully");
                            setRecordMatched(res.data);
                            props.handleOpenUploadStock();
                        }
                    })
                    .catch((error) => {
                        ToastError(error.response.data);
        
                    });
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
            <PoolStockCheck/>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    {/* <div className="dialog-title-contianer">
                                                <div className="dialog-icon">
                            <Packageplus />
                        </div>
                        <Closebutton className="cursor" onClick={handleClose} />
                    </div> */}
                    <div className="dialog-title">Upload Csv File</div>
                </DialogTitle>
                <DialogContent sx={{ padding: "0px 32px 40px 32px"}}>
                    {/* <div className="addstock-details">
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
                    </div> */}
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
                                        {/* <button className="remove-file-btn" onClick={() => setFiles([])}>Remove</button> */}
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
                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button
                        className={`submit-btn ${files.length === 0 || uploadProgress !== 100 ? "disabled-btn" : ""}`}
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UploadCsvFile;
