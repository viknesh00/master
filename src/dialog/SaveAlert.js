import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import { ReactComponent as AlertTriangle } from "../assets/svg/alert-triangle.svg";



const SaveAlert = (props) => {
  const [open] = useState(props.value);


  const handleClose = () => {
    props.handleClose();
  };

  const handlePrevent = () => {
    props.handleAlert();
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
          <div className="dialog-title-contianer">
            <div className="dialog-icon-alert">
              <AlertTriangle />
            </div>
          </div>
          <div className="dialog-title-alert">Unsaved Changes</div>
          <div className="dialog-description-alert">Are you sure you want to cancel and discard all changes?</div>
        </DialogTitle>
        <DialogActions class="dialog-alert-button">
          <button className="cancel-btn-alert" onClick={handlePrevent}>Cancel</button>
          <button className="submit-btn-alert" onClick={handleClose}>Confirm</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SaveAlert;
