import React, { useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import DropdownField from "../../utils/DropDown";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import Progressbar from "../../utils/Progressbar"
import { postRequest } from "../../services/ApiService";
import { useUser } from "../../UserContext";
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const BulkEdit = (props) => {
    const [open] = useState(props.value);
    const { name } = useUser();
    const { materialNumber, materialDescription, selectedSerialNumbers } = props;
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({
        RackLocation: "",
        statusChange: "",
    });

    const handleClose = () => {
        props.handleOpenBulkEditStock();
        console.log(formData);
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

    const handleBulkEditStock = () => {
        if (!formData.RackLocation && !formData.statusChange) {
        ToastError("Please enter at least one field (Rack Location or Status)");
        return;
    }
        let Data = {};
        Data = {
            ...Data,
            MaterialNumber: materialNumber,
            MaterialDescription: materialDescription,
            SerialNumbers: selectedSerialNumbers,
            RackLocation: formData.RackLocation || "",
            status: formData.statusChange || "",
        }
        

        const url = `SmInboundStockNonCiis/bulk-update`;

        postRequest(url, Data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Updated Successfully");
                    props.handleOpenBulkEditStock();
                }
            })
            .catch((error) => {
                ToastError(error.response.data);

            });
    }

    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    <div className="dialog-title">Bulk Edit Stock</div>
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
                            label="Rack Location"
                            name="RackLocation"
                            value={formData.RackLocation}
                            placeholder="Enter rack location"
                            onChange={handleInputChange}
                        />
                        <DropdownField
                            label="Status Change"
                            name="statusChange"
                            value={formData.statusChange}
                            placeholder="Select Device status"
                            onChange={handleInputChange}
                            options={["Used", "Damaged", "BreakFix"]}
                        />
                        {/* <Textfield
                        label={<span>Status<span className="error">*</span></span>}
                        name="status"
                        value={formData.status}
                        placeholder="Enter Status"
                        onChange={handleInputChange}
                    /> */}
                    </div>
                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleBulkEditStock}>
                        Submit
                    </button>

                </DialogActions>
            </Dialog>
        </div>
    );
};

export default BulkEdit;
