import React, { useState } from "react";
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
import { useUser } from "../../UserContext";


const AddDeliveryStock = (props) => {
    const [open] = useState(props.value);
    const { serialData } = props;
    const { fullName, name } = useUser();
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    const handleClose = () => {
        props.handleAddDelivery();
        console.log(formData);
    };

    const handleSave = () => {
        if(!formData.OrderNumber){
            ToastError("Please enter Order Number");
            return;
        }
        let Data = {};
        Data = {
            ...Data,
            username: name,
            deliveryNumber:  Math.floor((Math.abs(Math.sin(new Date().getTime())) * 100) % 100).toString().padStart(2, '0'),
            materialNumber: serialData.materialNumber,
            serialNumber: serialData.serialNumber,
            materialDescription: serialData.materialDescription,
            orderNumber: formData.OrderNumber,
            outBounddate: formData.OutBoundDate
            ? new Date(formData.OutBoundDate).toISOString()  // Convert to UTC Date format
            : null,
            targetLocation: formData.TargetLocation || "",
            receiverName: formData.ReceiverName || "",
            sentBy: formData.SentBy || "",
            fk_Inbound_StockCII_DeliveryNumber: serialData.deliveryNumber
        }

        const url = `SmOutboundStockCiis/AddOutboundData`;

        postRequest(url,Data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Material Deliverd Successfully");
                    props.handleAddDelivery();
                }
            })
            .catch((error) => {
                ToastError(error.response.data);
            });
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
                            label={<span>Order Number<span className="error">*</span></span>}
                            name="OrderNumber"
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                        />
                        <Datefield
                            label="OutBound Date"
                            name="OutBoundDate"
                            placeholder="Select Date"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label="Receiver Name"
                            name="ReceiverName"
                            placeholder="Enter receiver name"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label="Target Location"
                            name="TargetLocation"
                            placeholder="Enter target location"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label="Sent By"
                            name="SentBy"
                            placeholder="Enter sender name"
                            onChange={handleInputChange}
                        />
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>

                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleSave}>
                        Submit
                    </button>

                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddDeliveryStock;
