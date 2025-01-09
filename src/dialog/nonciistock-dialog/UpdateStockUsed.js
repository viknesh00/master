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


const UpdateStockUsed = (props) => {
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    const handleClose = () => {
        props.handleUpdateStockUsed();
        console.log(formData);
    };

    const handleAlert = () => {
        setShowAlert(true);
    };

    const handleInputChange = (label, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [label]: value,
        }));
    };

    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    <div className="dialog-title-contianer">
                        <div className="dialog-icon">
                            <Packageplus />
                        </div>
                        <Closebutton className="cursor" onClick={handleClose} />
                    </div>
                    <div className="dialog-title">Update Used Items</div>
                </DialogTitle>
                <DialogContent sx={{ padding: "0px 32px 40px 32px" }}>
                    <div className="addstock-details">
                        <div className="detail-item">
                            <span className="detail-label">Material Number</span>
                            <span className="detail-description">2017434318</span>
                        </div>
                        <span className="divider h-12 w-0.5 bg-[#6B7379] mx-2"></span>
                        <div className="detail-item">
                            <span className="detail-label">Material Description</span>
                            <span className="detail-description">
                                Daa Office Standard Laptop - 14” Touch, i5, 16GB, 512GB D - HP EliteBook 840 - DE Keyboard
                            </span>
                        </div>
                    </div>
                    <div className="grid-column">
                        <Textfield
                            label="Order Number"
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Return Location<span className="error">*</span></span>}
                            placeholder="Enter return location"
                            onChange={handleInputChange}
                        />
                        <Datefield
                            label={<span>Return Date<span className="error">*</span></span>}
                            placeholder="Select Date"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Item Quantity<span className="error">*</span></span>}
                            placeholder="Enter item quantity"
                            onChange={handleInputChange}
                        />
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleClose}>
                        Update
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateStockUsed;
