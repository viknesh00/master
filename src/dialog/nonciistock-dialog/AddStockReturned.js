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
import Description from "../../utils/Description";
import SaveAlert from "../SaveAlert";


const AddStockReturned = (props) => {
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    const handleClose = () => {
        props.handleOpenAddReturn();
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
                    <div className="dialog-title">Add Stock Return</div>
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
                            label={<span>Return Quantity<span className="error">*</span></span>}
                            placeholder="Enter return quantity"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Received By<span className="error">*</span></span>}
                            placeholder="Enter receiver name"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label="Rack Location"
                            placeholder="Enter rack location"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Return Type<span className="error">*</span></span>}
                            placeholder="Enter return quantity"
                            onChange={handleInputChange}
                        />
                        <div className="grid-span">
                            <Description
                                label={<span>Reason<span className="error">*</span></span>}
                                placeholder="Enter material description..."
                                rows={2}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleClose}>
                        Submit
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddStockReturned;
