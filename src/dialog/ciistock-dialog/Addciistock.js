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
import Description from "../../utils/Description";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";


const Addciistock = (props) => {
    const [open] = useState(props.value);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({});


    const handleClose = () => {
        props.handleOpenAddMaterial();
        console.log(formData)
    };

    const handleAddciistock = () => {
        if(formData.MaterialNumber == "" || formData.MaterialDescription == ""){
            ToastError("Please enter the Material Number and Material Description");
        }
        const url = `SmInboundStockCiis/Material/${formData.MaterialNumber}/${formData.MaterialDescription}`;

        postRequest(url)
            .then((res) => {
                if (res.status === 200) {
                    ToastSuccess("Material Added Successfully");
                    props.handleOpenAddMaterial();
                }
            })
            .catch((error) => {
                ToastError(error.response.data);
                
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
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
                    {/* <div className="dialog-title-contianer">
                        <div className="dialog-icon">
                            <Packageplus />
                        </div> 
                        <Closebutton className="cursor" onClick={handleClose} />
                    </div> */}
                    <div className="dialog-title">Add Material</div>
                </DialogTitle>
                <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
                    <div className="grid-column">
                        <Textfield
                            label="Material Number"
                            name="MaterialNumber"
                            placeholder="Enter Material Number"
                            onChange={handleInputChange}
                        />
                        <div className="grid-span">
                            <Description
                                label="Material Description"
                                name="MaterialDescription"
                                placeholder="Enter Material Description"
                                rows={4}
                                onChange={handleInputChange}
                            />
                        </div>
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

export default Addciistock;
