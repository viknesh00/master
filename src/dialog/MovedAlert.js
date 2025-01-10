import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import { ReactComponent as FlipForward } from "../assets/svg/flip-forward.svg";
import { postRequest } from "../services/ApiService";



const MovedAlert = (props) => {
  const [open] = useState(props.value);
  const {materialNumber, serialNumber} = props;


  const handleClose = () => {
    props.handlemovedtoused();
  };

  const handleSaveMovetoUsed = () => {
    debugger
    const status = "Used"
    const url = `SmInboundStockCiis/${materialNumber}/${serialNumber}/${status}`;
    postRequest(url)
              .then((res) => {
                  if (res.status === 200) {
                    alert("Product has been Moved to Used");
                    props.handlemovedtoused();
                  }
              })
              .catch((error) => {
                  console.error("API Error:", error);
              });
  }
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
          <button className="submit-btn-alert" onClick={handleSaveMovetoUsed}>Submit</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MovedAlert;
