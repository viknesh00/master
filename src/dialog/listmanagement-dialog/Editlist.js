import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { ReactComponent as Filecheck } from "../../assets/svg/filecheck.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import Textfield from "../../utils/Textfield";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";
import MultipleAdd from "../../utils/MultipleAdd";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";

const EditList = (props) => {
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        console.log(formData)
    }, [formData]);

    const handleClose = () => {
        props.handleOpenEditList();
        console.log(formData)
    };

    const handleAddciistock = () => {
        const url = `SmInboundStockCiis/Material/${formData.MaterialNumber}/${formData.MaterialDescription}`;

        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Material Added Successfully");
                    props.handleOpenEditList();
                }
            })
            .catch((error) => {
                ToastError("Entered Material Number Already Exists");

            });
    }

    const handleAlert = () => {
        setShowAlert(prevState => !prevState);
    }

    const handleInputChange = (label, value) => {
        const formattedLabel = label.replace(/\s+/g, ""); // Removes all spaces from the label
        setFormData((prevData) => ({
            ...prevData,
            [formattedLabel]: value,
        }));
    };

    return (
        <div>
            {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
            <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
                <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
                    <div className="dialog-title-contianer">
                        <div className="dialog-icon">
                            <Filecheck />
                        </div>
                        <Closebutton className="cursor" onClick={handleClose} />
                    </div>
                    <div className="dialog-title">Edit List</div>
                </DialogTitle>
                <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
                    <div className="grid-column-two">
                        <Textfield
                            label="List Name"
                            placeholder="Enter List"
                            onChange={handleInputChange}
                        />
                        <MultipleAdd
                            label="Value"
                            placeholder="Enter Value"
                            onChange={handleInputChange}
                        />
                    </div>
                </DialogContent>
                <DialogActions sx={{ padding: '0px 32px 32px 32px' }}>
                    <button className="cancel-btn" onClick={handleAlert}>Cancel</button>
                    <button className="submit-btn" onClick={handleAddciistock}>Submit</button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default EditList;
