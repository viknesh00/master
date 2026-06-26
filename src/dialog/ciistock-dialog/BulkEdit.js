import React, { useState, useEffect } from "react";
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
    const { name, fullName } = useUser();
    const { materialNumber, materialDescription, selectedData, materialData } = props;
    const [showAlert, setShowAlert] = useState(false);
    const [view, setView] = useState("form");
    const [formData, setFormData] = useState({
        RackLocation: "",
        statusChange: "",
        editType: "Bulk Edit Rack Location & Status",
        OrderNumber: "",
        OutBoundDate: "",
        ReceiverName: "",
        TargetLocation: "",
        SentBy: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
            setFormData({
                ...formData,
                SentBy: fullName,
            });
        }, [fullName]);

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
        if (isSubmitting) return; // prevent double click

        if (!formData.RackLocation && !formData.statusChange) {
        ToastError("Please enter at least one field (Rack Location or Status)");
        return;
    }
            setIsSubmitting(true);
        let Data = {};
        Data = {
            ...Data,
            MaterialNumber: materialNumber,
            MaterialDescription: materialDescription,
            SerialNumbers: selectedData.map((row) => row.serialNumber),
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
                setIsSubmitting(false);
            });
    }

    const handleBulkOutward = async () => {
        //debugger
        if (isSubmitting) return;

        if (!formData.OrderNumber) {
            ToastError("Please enter Order Number");
            return;
        }

        if (!formData.OutBoundDate) {
            ToastError("Please select OutBound Date");
            return;
        }

        if (!selectedData || selectedData.length === 0) {
            ToastError("Please select at least one Serial Number");
            return;
        }

        setIsSubmitting(true);

        const url = `SmOutboundStockCiis/AddOutboundData`;

        const Data = {
            username: name,
            deliveryNumber: Math.floor(
                (Math.abs(Math.sin(new Date().getTime())) * 100) % 100
            ).toString().padStart(2, '0'),

            materialNumber: materialNumber,
            materialDescription: materialDescription,

            SerialNumber: selectedData.map((row) => row.serialNumber), // ✅ ARRAY

            orderNumber: formData.OrderNumber,
            outBounddate: new Date(formData.OutBoundDate).toLocaleDateString('en-CA'),

            targetLocation: formData.TargetLocation || "",
            receiverName: formData.ReceiverName || "",
            sentBy: formData.SentBy || "",
            fk_Inbound_StockCII_DeliveryNumber: selectedData.map((row) => row.deliveryNumber) // ✅ ARRAY
        };

        try {
            const res = await postRequest(url, Data);

            if (res.status === 200) {
                ToastSuccess("All Materials Delivered Successfully");
                props.handleOpenBulkEditStock();
            }
        } catch (error) {
            ToastError(error.response?.data || "Error while processing");
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    <div className="dialog-title">Bulk Edit Stock</div>
                    {view === "form" ? (
                        <DropdownField
                            label="Bulk Edit Type"
                            name="editType"
                            value={formData.editType || "Bulk Edit Rack Location & Status"}
                            placeholder="Select Bulk Edit Type"
                            onChange={handleInputChange}
                            options={["Bulk Edit Rack Location & Status", "Bulk Outward"]}
                        />) : ""}
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
                        {formData.editType === "Bulk Edit Rack Location & Status" && (
                            <>
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
                            </>
                        )}

                        {formData.editType === "Bulk Outward" && (
                            <>
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
                                    value={formData.SentBy || ""}
                                    placeholder="Enter sender name"
                                    onChange={handleInputChange}
                                />
                            </>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button
                        className="submit-btn"
                        onClick={
                            formData.editType === "Bulk Outward"
                                ? handleBulkOutward   // your outward API
                                : handleBulkEditStock
                        }
                        disabled={isSubmitting}
                    >
                        Submit
                    </button>

                </DialogActions>
            </Dialog>
        </div>
    );
};

export default BulkEdit;
