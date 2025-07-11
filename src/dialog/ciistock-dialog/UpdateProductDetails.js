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
import { postRequest } from "../../services/ApiService";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";
import Datefield from "../../utils/Datefield";
import { useUser } from "../../UserContext";

const UpdateProductDetails = (props) => {
    debugger
    const [open] = useState(props.value);
    const { serialData } = props;
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});
    const { fullName, name } = useUser();

    useEffect(() => {
        if (serialData) {
            setFormData({
                ...serialData,
                qualityChecker: fullName,
            });
        }
    }, [serialData, fullName]);

    const handleClose = () => {
        props.handleProductDetails();
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

    const handleUpdate = () => {
        debugger
        if(!formData.qualityCheckDate){
            ToastError("Please select Quality checker date");
            return;
        }
        let data = {};
        data = {
            ...data,
            userName: name,
            materialNumber: formData.materialNumber,
            serialNumber: formData.serialNumber,
            existSerialNumber: serialData.serialNumber,
            rackLocation: serialData.rackLocation,
            deliveryNumber: formData.deliveryNumber,
            orderNumber: formData.orderNumber,
            inwardDate: new Date(formData.inwardDate).toISOString(),
            inwardFrom: formData.inwardFrom? formData.inwardFrom: serialData.sourceLocation? serialData.sourceLocation: "temp",
            receivedBy: formData.receivedBy,
            qualityCheckDate: formData.qualityCheckDate? new Date(formData.qualityCheckDate).toISOString() : null,
            qualityChecker: formData.qualityChecker,
            qualityCheckerStatus: formData.qualityCheckerStatus
        }
        const url = `SmInboundStockCiis/UpdateInbounddata`
        postRequest(url, data)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Product Details Updated Successfully");
                    props.updateSerialData(formData);
                    props.handleProductDetails();
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }


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
                    <div className="dialog-title">Update Product Details</div>
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
                            label="Serial Number"
                            name={"serialNumber"}
                            value={formData.serialNumber}
                            placeholder="Enter serial number"
                            onChange={handleInputChange}
                            readOnly={true}
                        />
                        {/* <Textfield
                            label={<span>Rack Location<span className="error">*</span></span>}
                            name={"rackLocation"}
                            value={formData.rackLocation}
                            placeholder="Enter rack location"
                            onChange={handleInputChange}
                        /> */}
                        <Datefield
                            label="Quality Checker Date"
                            placeholder="Quality Checker Date"
                            name="qualityCheckDate"
                            value={formData.qualityCheckDate}
                            onChange={handleInputChange}
                        />
                        <Textfield
                            label="Quality Checker"
                            name="qualityChecker"
                            value={formData.qualityChecker}
                            placeholder="Enter Quality Checker name"
                            onChange={handleInputChange}
                            readOnly={true}
                        />
                        <Textfield
                            label="Quality Checker Status"
                            name="qualityCheckerStatus"
                            value={formData.qualityCheckerStatus}
                            placeholder="Enter Quality Checker Status"
                            onChange={handleInputChange}
                        />
                    </div>

                </DialogContent>
                <DialogActions sx={{ padding: "0px 32px 32px 32px" }}>

                    <button className="cancel-btn" onClick={handleAlert}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleUpdate}>
                        Update
                    </button>

                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UpdateProductDetails;
