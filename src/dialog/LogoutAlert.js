import React from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";

const LogoutAlert = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
        <div className="dialog-title-alert">Logout</div>
        <div className="dialog-description-alert">Are you sure you want to logout?</div>
      </DialogTitle>
      <DialogActions class="dialog-alert-button">
        <button className="cancel-btn-alert" onClick={onClose}>No</button>
        <button className="submit-btn-alert" onClick={onConfirm}>Yes</button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutAlert;
