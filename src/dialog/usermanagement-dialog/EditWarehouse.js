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
import { useLocation } from "react-router-dom";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";


const EditWarehouse = (props) => {
  const location = useLocation();
  const [open] = useState(props.value);
  const companyId = location.pathname.split('/').pop();
  const {selectedrow, selectedWarehouseData} = props;
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});


  useEffect(() => {
    debugger
    if (selectedrow) {
      setFormData({
        "warehouseId" : selectedrow.tenentCode || "",
        "warehouseName": selectedrow.tenentName || "",
        "location": selectedrow.tenentLocation || "",
      });
    }
  }, [selectedrow]);

  const handleClose = () => {
    props.handleOpenEditWarehouse();
    console.log(formData)
  };

  const handleAlert = () => {
    setShowAlert(prevState => !prevState);
  }

  const handleUpdate = () => {
    let Data = {};
     Data = {...Data,
        ExistTenentCode: selectedWarehouseData.tenentCode,
        CompanyCode: selectedWarehouseData.companyCode,
        TenentCode: formData.warehouseId,
        TenentName: formData.warehouseName,
        TenentLocation: formData.location
     }
    const url = `UserManagement/UpdateTenet`;
    postRequest(url,Data)
      .then((res) => {
        if (res.status === 200) {
          alert("Warehouse Updated Successfully");
          props.handleOpenEditWarehouse();
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
          <div className="dialog-title">Update Warehouse</div>
        </DialogTitle>
        <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
          <div className="grid-column-one">
            <Textfield
              label="Warehouse ID"
              value={formData.warehouseId}
              placeholder="Enter Warehouse ID"
              onChange={handleInputChange}
              name="warehouseId"
            />
            <Textfield
              label="Warehouse Name"
              value={formData.warehouseName}
              placeholder="Enter Warehouse Name"
              onChange={handleInputChange}
              name="warehouseName"
            />
            <Textfield
              label="Location"
              value={formData.location}
              placeholder="Enter Location"
              onChange={handleInputChange}
              name="location"
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

export default EditWarehouse;
