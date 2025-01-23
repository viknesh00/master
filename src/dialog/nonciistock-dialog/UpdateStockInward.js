import React, { useState, useEffect } from "react";
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

const UpdateStockInward = (props) => {
    const location = useLocation();
    const {materialDescription } = props;
    const materialNumber = location.pathname.split('/').pop();
    const{selectedMaterialData,selectedRow} = props;
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (selectedMaterialData) {
          setFormData({
            "deliveryNumber" : selectedMaterialData.deliveryNumber,
            "orderNumber": selectedMaterialData.orderNumber,
            "inwardDate": selectedMaterialData.inwardDate,
            "inwardFrom": selectedMaterialData.sourceLocation,
            "enterQuantity":selectedMaterialData.deliveredQuantity,
            "receivedBy":selectedMaterialData.receivedBy,
            "rackLocation":selectedMaterialData.rackLocation
          });
        }
    }, [selectedMaterialData]);
    const handleClose = () => {
        props.handleUpdateStockInward();
        console.log(formData);
    };

    const handleUpdateInwardciistock = () => {
        let Data = {};
        Data = {
            ...Data,
            materialNumber: materialNumber,
            existDeliveryNumber: selectedMaterialData.deliveryNumber,
            deliveryNumber: formData.deliveryNumber,
            orderNumber: formData.orderNumber,
            existOrderNumber: selectedMaterialData.orderNumber,
            inwardDate: formData.inwardDate,
            inwardFrom: formData.inwardFrom,
            quantityReceived: formData.enterQuantity,
            receivedBy: formData.receivedBy,
            rackLocation: formData.rackLocation
        }
        const url = `SmInboundStockNonCiis/UpdateNonStockInbounddata`;

        postRequest(url, Data)
            .then((res) => {
                if (res.status === 200) {
                    alert("Stock Updated Successfully");
                    props.handleUpdateStockInward();
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
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
                    <div className="dialog-title-contianer">
                        <div className="dialog-icon">
                            <Packageplus />
                        </div>
                        <Closebutton className="cursor" onClick={handleClose} />
                    </div>
                    <div className="dialog-title">Update Stock Inward</div>
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
                            label="Delivery Number"
                            name="deliveryNumber"
                            placeholder="Enter Delivery Number"
                            onChange={handleInputChange}
                            value={formData.deliveryNumber}
                        />
                        <Textfield
                            label="Order Number"
                            name="orderNumber"
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                            value={formData.orderNumber}
                        />
                        <Datefield
                            label={<span>Inward Date<span className="error">*</span></span>}
                            name="inwardDate"
                            placeholder="Select Date"
                            onChange={handleInputChange}
                            value={formData.inwardDate}
                        />
                        <Textfield
                            label={<span>Inward From<span className="error">*</span></span>}
                            name="inwardFrom"
                            placeholder="Enter source location"
                            onChange={handleInputChange}
                            value={formData.inwardFrom}
                        />
                        <Textfield
                            label={<span>Quantity Received<span className="error">*</span></span>}
                            name="enterQuantity"
                            placeholder="Enter quantity"
                            onChange={handleInputChange}
                            value={formData.enterQuantity}
                        />
                        <Textfield
                            label={<span>Received By<span className="error">*</span></span>}
                            name="receivedBy"
                            placeholder="Enter receiver name"
                            onChange={handleInputChange}
                            value={formData.receivedBy}
                        />
                        <Textfield
                            label="Rack Location"
                            name="rackLocation"
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
                    <button className="submit-btn" onClick={handleUpdateInwardciistock}>
                        Update
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateStockInward;
