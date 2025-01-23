import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import Textfield from "../../utils/Textfield";
import SaveAlert from "../SaveAlert";
import Datefield from "../../utils/Datefield";
import { postRequest } from "../../services/ApiService";


const UpdateDeliveryDetails = (props) => {

    const [open] = useState(props.value);
    const {selectedRow,serialData,deliveryData,selectedMaterialData} = props;
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

     useEffect(() => {
        if (selectedRow && serialData) {
            setFormData({
                "materialNumber": serialData.materialNumber || "",
                "serialNumber": serialData.serialNumber,
                "orderNumber": selectedMaterialData.outBoundOrderNumber,
                "outbounddate": new Date(selectedRow.outBoundDate.split('/').reverse().join('-')),
                "targetLocation": selectedRow.targetLocation,
                "receiverName": selectedRow.receiverName,
                "sentBy": selectedRow.sentby
            });
        }
      }, [selectedRow,serialData]);

    const handleClose = () => {
        props.handleDeliveryDetails();
        console.log(formData);
    };

    const handleAlert = () => {
        setShowAlert(prevState => !prevState);
    };

    const handleSave = () => {
            let Data = {};
            Data = {
                ...Data,
                materialNumber: serialData.materialNumber,
                serialNumber: serialData.serialNumber,
                orderNumber: formData.orderNumber, 
                ExistOrderNumber: selectedMaterialData.outBoundOrderNumber,
                outBounddate: new Date(formData.outbounddate).toISOString(),
                targetLocation: formData.targetLocation,
                receiverName: formData.receiverName,
                sentBy: formData.sentBy,
            }
    
            const url = `SmOutboundStockCiis/UpdatedeliveryData`;
    
            postRequest(url,Data)
                .then((res) => {
                    if (res.status === 200) {
                        alert(" Deliverd Record Updated Successfully");
                        props.handleDeliveryDetails();
                    }
                })
                .catch((error) => {
                    console.error("API Error:", error);
                });
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
                    <div className="dialog-title-contianer">
                        <div className="dialog-icon">
                            <Packageplus />
                        </div>
                        <Closebutton className="cursor" onClick={handleClose} />
                    </div>
                    <div className="dialog-title">Update Stock Delivery Details</div>
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
                            label="Order Nummber"
                            placeholder="Enter order number"
                            name="orderNumber"
                            value={formData.orderNumber}
                            onChange={handleInputChange}
                        />
                        <Datefield
                            label={<span>Outbound Date<span className="error">*</span></span>}
                            placeholder="Select Date"
                            name="outbounddate"
                            value={formData.outbounddate}
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Receiver Name<span className="error">*</span></span>}
                            placeholder="Enter receiver name"
                            name="receiverName"
                            value={formData.receiverName}
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Target Location<span className="error">*</span></span>}
                            placeholder="Enter target location"
                            name="targetLocation"
                            value={formData.targetLocation}
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Sent By<span className="error">*</span></span>}
                            placeholder="Enter sender name"
                            name="sentBy"
                            value={formData.sentBy}
                            onChange={handleInputChange}
                        />
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>

                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleSave}>
                        Update
                    </button>

                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateDeliveryDetails;
