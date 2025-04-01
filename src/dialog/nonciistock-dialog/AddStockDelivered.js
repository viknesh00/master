import React, { useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const AddStockDelivered = (props) => {
    const location = useLocation();
    const {materialDescription } = props;
    const materialNumber = location.pathname.split('/').pop();
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    const handleClose = () => {
        props.handleOpenAddDelivery();
        console.log(formData);
    };

    const handleAddDeliveredciistock = () => {
        if (!formData.deliveryNumber || !formData.orderNumber) {
            ToastError("Delivery Number and Order Number should not be empty");
            return; // Stop further execution if validation fails
        }
        let Data = {};
        Data = {
            ...Data,
            materialNumber: materialNumber,
            materialDescription: materialDescription,
            deliveryNumber: formData.deliveryNumber,
            orderNumber: formData.orderNumber,
            outboundDate: new Date(formData.outboundDate).toISOString(),
            receiverName: formData.receiverName,
            deliveredQuantity: formData.quantityDelivered,
            targetLocation: formData.targetLocation,
            sentBy: formData.sentBy,
            deliveryNumber_inbound: formData.deliveryNumber
        }
        const url = `SmInboundStockNonCiis/AddNonStockOutbounddata`;

        postRequest(url, Data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Stock Added Successfully");
                    props.handleOpenAddDelivery();
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
        debugger
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
                    <div className="dialog-title">Add Stock Delivery</div>
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
                    <div className="grid-column">
                        <Textfield
                            name="deliveryNumber"
                            label={<span>Delivery Number<span className="error">*</span></span>}
                            placeholder="Enter delivery number"
                            onChange={handleInputChange}
                            value={formData.deliveryNumber}
                        />
                        <Textfield
                            name="orderNumber"
                            label={<span>Order Number<span className="error">*</span></span>}
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                            value={formData.orderNumber}
                        />
                        <Datefield
                            name="outboundDate"
                            label={<span>Outbound Date<span className="error">*</span></span>}
                            placeholder="Select Date"
                            onChange={handleInputChange}
                            value={formData.outboundDate}
                        />
                        <Textfield
                            name="receiverName"
                            label={<span>Receiver Name<span className="error">*</span></span>}
                            placeholder="Enter receiver name"
                            onChange={handleInputChange}
                            value={formData.receiverName}
                        />
                        <Textfield
                            name="targetLocation"
                            label={<span>Target Location<span className="error">*</span></span>}
                            placeholder="Enter target location"
                            onChange={handleInputChange}
                            value={formData.targetLocation}
                        />
                        <Textfield
                            name="quantityDelivered"
                            label={<span>Quantity Delivered<span className="error">*</span></span>}
                            placeholder="Enter quantity delivered"
                            onChange={handleInputChange}
                            value={formData.quantityDelivered}
                        />
                        <Textfield
                            name="sentBy"
                            label={<span>Sent By<span className="error">*</span></span>}
                            placeholder="Enter Sender Name"
                            onChange={handleInputChange}
                            value={formData.sentBy}
                        />
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleAddDeliveredciistock}>
                        Submit
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddStockDelivered;
