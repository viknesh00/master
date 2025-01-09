import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import { ReactComponent as FlipForward } from "../assets/svg/flip-forward.svg";



const MovedAlert = (props) => {
  const [open] = useState(props.value);


  const handleClose = () => {
    props.handlemovedtoused();
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
          <div className="dialog-title-contianer">
            <div className="dialog-icon-alert">
              <FlipForward />
            </div>
          </div>
          <div className="dialog-title-alert">Move to Used</div>
          <div className="dialog-description-alert">Are you sure want to move to used?</div>
        </DialogTitle>
        <DialogActions class="dialog-alert-button">
          <button className="cancel-btn-alert" onClick={handleClose}>Cancel</button>
          <button className="submit-btn-alert" onClick={handleClose}>Submit</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MovedAlert;
