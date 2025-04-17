import React, { useState,useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const UpdateStockInwardDetails = (props) => {
    const { serialData } = props;
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (serialData) {
            setFormData(serialData);
        }
    }, [serialData]);

    const handleClose = () => {
        props.handleInwardDetails();
        console.log(formData);
    };

    const handleUpdate = () => {
        debugger
        let data = {};
        data = {
            ...data,
            materialNumber: formData.materialNumber,
            serialNumber: formData.serialNumber,
            existSerialNumber: serialData.serialNumber,
            rackLocation: formData.rackLocation,
            deliveryNumber: formData.deliveryNumber,
            orderNumber: formData.orderNumber,
            inwardDate: new Date(formData.inwardDate).toISOString(),
            inwardFrom: formData.sourceLocation ||  "temp",
            receivedBy: formData.receivedBy,
            qualityChecker: serialData.qualityChecker,
            qualityCheckerStatus: serialData.qualityCheckerStatus,
            qualityCheckDate: serialData.qualityCheckDate
        }
        const url = `SmInboundStockCiis/UpdateInbounddata`
        postRequest(url, data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Product Details Updated Successfully");
                    props.updateSerialData(formData);
                    props.handleInwardDetails();
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
                    <div className="dialog-title">Update Stock Inward Details</div>
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
                        <Textfield
                            label="Delivery Number"
                            name={"deliveryNumber"}
                            placeholder="Enter delivery number"
                            onChange={handleInputChange}
                            value={formData.deliveryNumber}
                        />
                        <Textfield
                            label="Order Number"
                            name={"orderNumber"}
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                            value={formData.orderNumber}
                        />
                        <Datefield
                            label={<span>Inward Date<span className="error">*</span></span>}
                            name={"inwardDate"}
                            placeholder="Select Date"
                            onChange={handleInputChange}
                            value={formData.inwardDate}
                        />
                        <Textfield
                            label={<span>Inward From<span className="error">*</span></span>}
                            name={"sourceLocation"}
                            placeholder="Enter source location"
                            onChange={handleInputChange}
                            value={formData.sourceLocation}
                        />
                        <Textfield
                            label={<span>Received By<span className="error">*</span></span>}
                            name={"receivedBy"}
                            placeholder="Enter receiver name"
                            onChange={handleInputChange}
                            value={formData.receivedBy}
                        />
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>

                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleUpdate}>
                        Update
                    </button>

                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateStockInwardDetails;
