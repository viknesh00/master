import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import DropdownField from "../../utils/DropDown";
import Textfield from "../../utils/Textfield";
import Datefield from "../../utils/Datefield";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";
import { useUser } from "../../UserContext";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const NonCiiBulkOutwardDialog = (props) => {
    const [open] = useState(props.value);
    const { name, fullName } = useUser();
    const { selectedData, handleOpenBulkOutward } = props;
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({
        OrderNumber: "",
        OutBoundDate: "",
        ReceiverName: "",
        Location: "",
        SentBy: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            SentBy: fullName || "",
        }));
    }, [fullName]);

    const handleClose = () => {
        handleOpenBulkOutward();
    };

    const handleAlert = () => {
        setShowAlert((prevState) => !prevState);
    };

    const handleInputChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleBulkOutward = async () => {
        if (isSubmitting) return;

        if (!formData.OrderNumber) {
            ToastError("Please enter Order Number");
            return;
        }

        if (!formData.OutBoundDate) {
            ToastError("Please select Outbound Date");
            return;
        }

        if (!formData.Location) {
            ToastError("Please select Location");
            return;
        }
        if (!formData.Status) {
            ToastError("Please enter Status");
            return;
        }

        if (!selectedData || selectedData.length === 0) {
            ToastError("Please select at least one Inward Batch");
            return;
        }

        setIsSubmitting(true);

        const url = `SmInboundStockNonCiis/BulkAddNonStockOutbound`;

        try {
            const dataList = selectedData.map((row) => ({
                username: name,
                materialNumber: row.materialNumber,
                materialDescription: row.materialDescription || "",
                deliveryNumber: row.deliveryNumber,
                orderNumber: formData.OrderNumber,
                outboundDate: formData.OutBoundDate ? new Date(formData.OutBoundDate).toLocaleDateString('en-CA') : null,
                receiverName: formData.ReceiverName || "",
                deliveredQuantity: formData.deliveredQuantity,
                targetLocation: formData.Location || "",
                sentBy: formData.SentBy || "",
                deliveryNumber_inbound: formData.deliveredNumber,
                inboundStockNonCIIKey: row.inboundStockNonCIIKey,
                Status: formData.Status || "",
                SubStatus: formData.SubStatus || "",
            }));

            const res = await postRequest(url, dataList);

            if (res.status === 200) {
                ToastSuccess("All Selected Stocks Outwarded Successfully");
                handleOpenBulkOutward();
            } else {
                ToastError("Bulk outward failed. Please check and retry.");
                setIsSubmitting(false);
            }
        } catch (error) {
            ToastError(error.response?.data || "Error while processing bulk outward");
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: "32px 32px 32px 32px" }}>
                    <div className="dialog-title">Non-CII Bulk Outward</div>
                </DialogTitle>
                <DialogContent sx={{ padding: "0px 32px 40px 32px" }}>
                    <div className="grid-column">
                        <Textfield
                            label={<span>Order Number<span className="error">*</span></span>}
                            name="OrderNumber"
                            placeholder="Enter order number"
                            onChange={handleInputChange}
                            value={formData.OrderNumber}
                        />
                        <Textfield
                            label="Delivered Number"
                            placeholder="Enter delivered number"
                            name="deliveredNumber"
                            onChange={handleInputChange}
                            required={true}
                            value={formData.deliveredNumber}
                        />
                        <Datefield
                            label="Outbound Date"
                            name="OutBoundDate"
                            placeholder="Select Date"
                            onChange={handleInputChange}
                            value={formData.OutBoundDate}
                        />
                        <Textfield
                            label="Receiver Name"
                            name="ReceiverName"
                            placeholder="Enter receiver name"
                            onChange={handleInputChange}
                            value={formData.ReceiverName}
                        />
                        <DropdownField
                            label={<span>Location<span className="error">*</span></span>}
                            name="Location"
                            value={formData.Location}
                            placeholder="Select Location"
                            onChange={handleInputChange}
                            options={["SIFI-Warehouse", "SIFI-Poststelle", "UT-CollectionPoint", "UT-ITPunktNeckartal", "SIFI-S2D", "Deizisau", "Transport"]}
                        />
                        <Textfield
                            label="Delivered Quantity"
                            placeholder="Enter delivered quantity"
                            name="deliveredQuantity"
                            type="number"
                            onChange={handleInputChange}
                            required={true}
                            value={formData.deliveredQuantity}
                        />
                        <Textfield
                            label="Sent By"
                            name="SentBy"
                            value={formData.SentBy || ""}
                            placeholder="Enter sender name"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label={<span>Status<span className="error">*</span></span>}
                            name="Status"
                            placeholder="Enter status"
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label="Sub Status"
                            name="SubStatus"
                            placeholder="Enter sub status"
                            onChange={handleInputChange}
                        />
                    </div>
                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>
                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button
                        className="submit-btn"
                        onClick={handleBulkOutward}
                        disabled={isSubmitting}
                    >
                        Submit
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default NonCiiBulkOutwardDialog;
