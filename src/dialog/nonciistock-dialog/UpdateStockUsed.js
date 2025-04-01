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

const UpdateStockUsed = (props) => {
    const location = useLocation();
    const {materialDescription, selectedMaterialData } = props;
    const materialNumber = location.pathname.split('/').pop();
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (selectedMaterialData) {
            setFormData({
                "orderNumber": selectedMaterialData.orderNumber,
                "returnLocation":selectedMaterialData.returnLocation,
                "returnDate": selectedMaterialData.returnDate,
                "itemQuantity": selectedMaterialData.itemQuantity,
            });
        }
    }, [selectedMaterialData]);

    const handleClose = () => {
        props.handleUpdateStockUsed();
        console.log(formData);
    };

    const handleUpdateUsednonciistock = () => {
        let Data = {};
        Data = {
            ...Data,
            materialNumber: materialNumber,
            orderNumber: formData.orderNumber,
            existOrderNumber: selectedMaterialData.orderNumber,
            returnLocation:formData.returnLocation,
            returnDate: formData.returnDate,
            itemQuantity: formData.itemQuantity,
        }
        const url = `SmInboundStockNonCiis/UpdateNonStockUsedData`;

        postRequest(url, Data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Stock Updated Successfully");
                    props.handleUpdateStockUsed();
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
                    {/* <div className="dialog-title-contianer">
                                                <div className="dialog-icon">
                            <Packageplus />
                        </div>
                        <Closebutton className="cursor" onClick={handleClose} />
                    </div> */}
                    <div className="dialog-title">Update Used Items</div>
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
                            name="orderNumber"
                            label="Order Number"
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                            value={formData.orderNumber}
                        />
                        <Textfield
                            name="returnLocation"
                            label={<span>Return Location<span className="error">*</span></span>}
                            placeholder="Enter return location"
                            onChange={handleInputChange}
                            value={formData.returnLocation}
                        />
                        <Datefield
                            name="returnDate"
                            label={<span>Return Date<span className="error">*</span></span>}
                            placeholder="Select Date"
                            onChange={handleInputChange}
                            value={formData.returnDate}
                        />
                        <Textfield
                            name="itemQuantity"
                            label={<span>Item Quantity<span className="error">*</span></span>}
                            placeholder="Enter item quantity"
                            onChange={handleInputChange}
                            value={formData.itemQuantity}
                        />
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleUpdateUsednonciistock}>
                        Update
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateStockUsed;
