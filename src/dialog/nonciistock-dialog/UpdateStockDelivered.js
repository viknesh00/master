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
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const UpdateStockDelivered = (props) => {
    
    const location = useLocation();
    const {materialDescription, selectedMaterialData } = props;
    const materialNumber = location.pathname.split('/').pop();
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

        useEffect(() => {
            if (selectedMaterialData) {
              setFormData({
                "deliveryNumber": selectedMaterialData.deliveryNumber,
                "orderNumber": selectedMaterialData.orderNumber,
                "outboundDate": selectedMaterialData.outboundDate,
                "receiverName":selectedMaterialData.receiverName,
                "targetLocation":selectedMaterialData.targetLocation,
                "deliveredQuantity":selectedMaterialData.deliveredQuantity,
                "sentBy":selectedMaterialData.sentBy
              });
            }
        }, [selectedMaterialData]);

    const handleClose = () => {
        props.handleUpdateStockDelivered();
        console.log(formData);
    };

    const handleUpdateDeliveredciistock = () => {
                let Data = {};
                 Data = {
                    ...Data,
                    materialNumber:materialNumber,
                    materialDescription:materialDescription,
                    existDeliveryNumber:selectedMaterialData.deliveryNumber,
                    deliveryNumber:formData.deliveryNumber,
                    orderNumber:formData.orderNumber,
                    existOrderNumber:selectedMaterialData.orderNumber,
                    outboundDate: new Date(formData.outboundDate).toISOString(),
                    receiverName:formData.receiverName,
                    targetLocation:formData.targetLocation,
                    deliveredQuantity:formData.deliveredQuantity,
                    existDeliveredQuantity: selectedMaterialData.deliveredQuantity,
                    sentBy:formData.sentBy,
                    deliveryNumber_inbound: formData.deliveryNumber
                }
                const url = `SmInboundStockNonCiis/UpdateNonStockDeliverdata`;
        
                postRequest(url,Data)
                    .then((res) => {
                        if (res.status === 200) {
                            ToastSuccess("Stock Updated Successfully");
                            props.handleUpdateStockDelivered();
                        }
                    })
                    .catch((error) => {
                        console.error("API Error:", error);
                    });
    }

    const handleAlert = () => {
        setShowAlert(true);
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
                    <div className="dialog-title">Update Stock Delivery</div>
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
                            label="Delivery Number"
                            placeholder="Enter delivery number"
                            onChange={handleInputChange}
                            value={formData.deliveryNumber}
                            readOnly={true}
                        />
                        <Textfield
                            name="orderNumber"
                            label="Order Number"
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
                            name="deliveredQuantity"
                            label={<span>Quantity Delivered<span className="error">*</span></span>}
                            placeholder="Enter quantity delivered"
                            onChange={handleInputChange}
                            value={formData.deliveredQuantity}
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
                    <button className="submit-btn" onClick={handleUpdateDeliveredciistock}>
                        Update
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateStockDelivered;
