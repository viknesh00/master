import React, { useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import { useLocation } from "react-router-dom";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";
import { useUser } from "../../UserContext";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const AddStockInward = (props) => {
    const location = useLocation();
    const { name } = useUser();
    const {materialDescription } = props;
    const materialNumber = location.pathname.split('/').pop();
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    const handleClose = () => {
        props.handleOpenAddStock();
        console.log(formData);
    };

    const handleAddInwardciistock = () => {
        if(!formData.deliveryNumber || !formData.enterQuantity){
            ToastError("Please enter Delivery Number and Quantity Received");
            return;
        }
        let Data = {};
        Data = {
            ...Data,
            materialNumber: materialNumber,
            materialDescription: materialDescription,
            deliveryNumber: formData.deliveryNumber,
            orderNumber: formData.orderNumber || "",
            inwardDate: formData.inwardDate? new Date(formData.inwardDate).toISOString() : null, 
            inwardFrom: formData.inwardFrom || "",
            quantityReceived: formData.enterQuantity,
            receivedBy: formData.receivedBy || "",
            rackLocation: formData.rackLocation || "",
            username: name
        }
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
            });
    }

    const handleAlert = () => {
            setShowAlert(prevState => !prevState);
        }

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
                    <div className="dialog-title">Add Stock Inward</div>
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
                            placeholder="Enter Delivery Number"
                            onChange={handleInputChange}
                            value={formData.deliveryNumber}
                        />
                        <Textfield
                            name="orderNumber"
                            label="Order Number"
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                            value={formData.orderNumber}
                        />
                        <Datefield
                            name="inwardDate"
                            label="Inward Date"
                            placeholder="Select Date"
                            onChange={handleInputChange}
                            value={formData.inwardDate}
                        />
                        <Textfield
                            name="inwardFrom"
                            label="Inward From"
                            placeholder="Enter source location"
                            onChange={handleInputChange}
                            value={formData.inwardFrom}
                        />
                        <Textfield
                            name="enterQuantity"
                            label={<span>Quantity Received<span className="error">*</span></span>}
                            placeholder="Enter quantity"
                            onChange={handleInputChange}
                            value={formData.enterQuantity}
                        />
                        <Textfield
                            name="receivedBy"
                            label="Received By"
                            placeholder="Enter receiver name"
                            onChange={handleInputChange}
                            value={formData.receivedBy}
                        />
                        <Textfield
                            name="rackLocation"
                            label="Rack Location"
                            placeholder="Enter rack location"
                            onChange={handleInputChange}
                            value={formData.rackLocation}
                        />
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleAddInwardciistock}>
                        Submit
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddStockInward;
