import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import { ReactComponent as FlipForward } from "../assets/svg/flip-forward.svg";
import { postRequest } from "../services/ApiService";
import { ToastError, ToastSuccess } from "../services/ToastMsg";
import DropdownField from "../utils/DropDown";
import { useUser } from "../UserContext";



const MovedAlert = (props) => {
  const { name } = useUser();
  const [open] = useState(props.value);
  const {materialNumber, serialNumber} = props;
    const [formData, setFormData] = useState({});


  const handleClose = () => {
    props.handlemovedtoused();
  };

  const handleSaveMovetoUsed = () => {
    if (!formData.statusChange) {
      return ToastError("Please select the Status Change");
    }
    const status = formData.statusChange
    const url = `SmInboundStockCiis/UpdateSerialStatus/${materialNumber}/${serialNumber}/${status}/${name}`;
    postRequest(url)
              .then((res) => {
                  if (res.status === 200) {
                    ToastSuccess("Status Changed Successfully");
                    props.handlemovedtoused();
                  }
              })
              .catch((error) => {
                //console.log("error",error);
                  ToastError(error.response.data);
              });
  }

  const handleInputChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
          <div className="dialog-title-contianer">
            {/* <div className="dialog-icon-alert">
              <FlipForward />
            </div> */}
          </div>
          <div className="dialog-title-alert">Status Change</div>               
              <DropdownField
                label="Status Change"
                name="statusChange"
                value={formData.statusChange}
                placeholder="Select Device status"
                onChange={handleInputChange}
                options={["Used", "Damaged", "BreakFix"]}
              />
          <div className="dialog-description-alert">Are you sure want to Change the Status?</div>
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
