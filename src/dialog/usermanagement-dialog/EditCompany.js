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
import Description from "../../utils/Description";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";


const EditCompany = (props) => {
  const [open] = useState(props.value);
  const {selectedrow} = props;
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});


  useEffect(() => {
    debugger
    if (selectedrow) {
      setFormData({
        "companyId" : selectedrow.companyId || "",
        "companyName": selectedrow.companyName || "",
        "domainName": selectedrow.domain || "",
      });
    }
  }, [selectedrow]);

  const handleClose = () => {
    props.handleOpenEditCompany();
    console.log(formData)
  };

  const handleAlert = () => {
    setShowAlert(prevState => !prevState);
  }

  const handleUpdate = () => {
    const url = `SmInboundStockCiis/update/${formData.ExistingNumber}/${formData.MaterialNumber}/${formData.MaterialDescription}`;
    postRequest(url)
      .then((res) => {
        if (res.status === 200) {
          alert("Material Updated Successfully");
          props.handleOpenEditCompany();
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
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
      {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
          <div className="dialog-title-contianer">
            <div className="dialog-icon">
              <Packageplus />
            </div>
            <Closebutton className="cursor" onClick={handleClose} />
          </div>
          <div className="dialog-title">Update Company</div>
        </DialogTitle>
        <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
          <div className="grid-column-one">
            <Textfield
              label="Company ID"
              value={formData.companyId}
              placeholder="Enter Company ID"
              onChange={handleInputChange}
              name="companyId"
            />
            <Textfield
              label="Company Name"
              value={formData.companyName}
              placeholder="Enter Company Name"
              onChange={handleInputChange}
              name="companyName"
            />
            <Textfield
              label="Domain Name"
              value={formData.domainName}
              placeholder="Enter Domain Name"
              onChange={handleInputChange}
              name="domainName"
            />

          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '0px 32px 32px 32px' }}>
          <button className="cancel-btn" onClick={handleAlert}>Cancel</button>
          <button className="submit-btn" onClick={handleUpdate}>Submit</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EditCompany;
