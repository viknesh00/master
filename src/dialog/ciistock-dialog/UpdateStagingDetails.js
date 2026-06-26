import React, { useState,useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import DropdownField from "../../utils/DropDown";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import { putRequest } from "../../services/ApiService";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";
import { useUser } from "../../UserContext";

const UpdateStagingDetails = (props) => {
    // 
    const { serialData,stagingData } = props;
    const { fullName, name } = useUser();
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
    if (stagingData) {
        setFormData((prev) => ({
            ...prev,
            ...stagingData,
            receivedBy: fullName   
        }));
    }
}, [serialData,stagingData, fullName]);

    const handleClose = () => {
        props.handleStagingDetails();
        console.log(formData);
    };

    const handleUpdate = () => {
        // 
        if (isSubmitting) return; // prevent double click
        setIsSubmitting(true);

        if (!formData.type || !formData.deviceStatus) {
            ToastError("Please select Type and Device Status");
            return;
        };
        let data = {};
        data = {
            userName: name,                          // matches UserName in model
            materialNumber: serialData.materialNumber,
            serialNumber: serialData.serialNumber,
            orderNumber: formData.orderNumber,
            type: formData.type,
            deviceStatus: formData.deviceStatus,
            qcDate: formData.qcDate,
            qcBy: formData.qcBy,
            date: formData.date
        };
        const url = `SmOutboundStockCiis/UpdateStaging`
        putRequest(url, data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Staging Details Updated Successfully");
                    props.updateSerialData(formData);
                    props.handleStagingDetails();
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }

    const handleAlert = () => {
        setShowAlert(prevState => !prevState);
    };

    const handleInputChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    {/* <div className="dialog-title-contianer">
                                                <div className="dialog-icon">
                            <Packageplus />
                        </div>
                        <Closebutton className="cursor" onClick={handleClose} />
                    </div> */}
                    <div className="dialog-title">Update Staging Section Details</div>
                </DialogTitle>
                <DialogContent sx={{ padding: "0px 32px 40px 32px" }}>
                    <div className="addstock-details">
                        <div className="detail-item">
                            <span className="detail-label">Material Number</span>
                            <span className="detail-description">{serialData.materialNumber}</span>
                        </div>
                        <span className="divider h-12 w-0.5 bg-[#6B7379] mx-2"></span>
                        <div className="detail-item">
                            <span className="detail-label">Serial Number</span>
                            <span className="detail-description">{serialData.serialNumber}</span>
                        </div>
                        <span className="divider h-12 w-0.5 bg-[#6B7379] mx-2"></span>
                        <div className="detail-item">
                            <span className="detail-label">Material Description</span>
                            <span className="detail-description">
                                {serialData.materialDescription}
                            </span>
                        </div>
                    </div>

                   
                    <div className="grid-column">
                        <Datefield
                            label="Date"
                            name={"date"}
                            placeholder="Select Date"
                            onChange={handleInputChange}
                            value={formData.Date}
                        />
                        <Textfield
                            label="Order Number"
                            name={"orderNumber"}
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                            value={formData.orderNumber}
                        />
                        <DropdownField
                            label={<span>Type<span className="error">*</span></span>}
                            name="type"
                            value={formData.type}
                            placeholder="Select Type"
                            onChange={handleInputChange}
                            options={["BAU", "Refresh"]}
                        />
                        <DropdownField
                            label={<span>Device Status<span className="error">*</span></span>}
                            name="deviceStatus"
                            value={formData.deviceStatus}
                            placeholder="Select Device Status"
                            onChange={handleInputChange}
                            options={["Staging in Progress", "QC Completed"]}
                        />
                        <Datefield
                            label={<span>Qc Date<span className="error">*</span></span>}
                            name={"qcDate"}
                            placeholder="Select Date"
                            onChange={handleInputChange}
                            value={formData.qcDate}
                        />
                        <Textfield
                            label={<span>Qc By<span className="error">*</span></span>}
                            name={"qcBy"}
                            placeholder="Enter QC person name"
                            onChange={handleInputChange}
                            value={formData.qcBy}
                        />
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>

                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleUpdate} disabled={isSubmitting}>
                        Update
                    </button>

                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateStagingDetails;
