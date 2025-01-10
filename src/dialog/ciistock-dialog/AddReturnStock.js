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
import Description from "../../utils/Description";
import { postRequest } from "../../services/ApiService";


const AddReturnStock = (props) => {
    const [open] = useState(props.value);
    const { serialData } = props
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    const handleClose = () => {
        props.handleReturnDelivery();
        console.log(formData);
    };

    const handleAlert = () => {
        setShowAlert(prevState => !prevState);
    };

    const handleSave = () => {
        let Data = {};
        Data = {
            ...Data,
            deliveryNumber: Math.floor((Math.abs(Math.sin(new Date().getTime())) * 100) % 100).toString().padStart(2, '0'),
            materialNumber: serialData.materialNumber,
            serialNumber: serialData.serialNumber,
            materialDescription: serialData.materialDescription,
            orderNumber: formData.OrderNumber,
            locationReturnedFrom: formData.ReturnLocation,
            returneddate: new Date(formData.ReturnDate).toISOString(),
            returnedBy: formData.ReceivedBy,
            rackLocation: formData.RackLocation,
            returnType: formData.ReturnType,
            returns: formData.Return,
        }

        const url = `SmOutboundStockCiis/AddReturnData`;

        postRequest(url, Data)
            .then((res) => {
                if (res.status === 200) {
                    alert("Material Returned Successfully");
                    props.handleReturnDelivery();
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
                    <div className="dialog-title">Add Stock Return</div>
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
                            label="Order Number"
                            name="OrderNumber"
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Return Location<span className="error">*</span></span>}
                            name="ReturnLocation"
                            placeholder="Enter return location"
                            onChange={handleInputChange}
                        />
                        <Datefield
                            label={<span>Return Date<span className="error">*</span></span>}
                            name="ReturnDate"
                            placeholder="Select Date"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Received By<span className="error">*</span></span>}
                            name="ReceivedBy"
                            placeholder="Enter receiver name"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Rack Location<span className="error">*</span></span>}
                            name="RackLocation"
                            placeholder="Enter rack location"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Return Type<span className="error">*</span></span>}
                            name="ReturnType"
                            placeholder="Enter return quantity"
                            onChange={handleInputChange}
                        />
                        <div className="grid-span">
                            <Description
                                label={<span>Return<span className="error">*</span></span>}
                                name="Return"
                                placeholder="Enter material description..."
                                rows={4}
                                onChange={handleInputChange}
                            />
                        </div>
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

export default AddReturnStock;
