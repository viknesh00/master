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


const Addnonciistock = (props) => {
  const [open] = useState(props.value);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});


  const handleClose = () => {
    props.handleOpenAddMaterial();
    debugger
    console.log(formData)
  };

  const handleAlert = () => {
    setShowAlert(true);
  }



  const handleInputChange = (label, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [label]: value,
    }));
  };

  return (
    <div>
      {showAlert && <SaveAlert value={showAlert} handleClose={handleClose} />}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
          <div className="dialog-title-contianer">
            <div className="dialog-icon">
              <Packageplus />
            </div>
            <Closebutton className="cursor" onClick={handleClose} />
          </div>
          <div className="dialog-title">Add Material</div>
        </DialogTitle>
        <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
          <div className="grid-column">
            <Textfield
              label="Material Number"
              placeholder="Enter Material Number"
              onChange={handleInputChange}
            />
            <div className="grid-span">
              <Description
                label="Material Description"
                placeholder="Enter Material Description"
                rows={4}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '0px 32px 32px 32px' }}>
          <button className="cancel-btn" onClick={handleAlert}>Cancel</button>
          <button className="submit-btn" onClick={handleClose}>Submit</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Addnonciistock;
