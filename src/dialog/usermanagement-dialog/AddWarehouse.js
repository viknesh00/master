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
import { useLocation } from "react-router-dom";
import { postRequest } from "../../services/ApiService";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";


const AddWarehouse = (props) => {
  const location = useLocation();
  const companyId = location.pathname.split('/').pop();
  const [open] = useState(props.value);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});


  const handleAddwarehouse = () => {
          let Data = {};
          Data = { ...Data,
            CompanyCode : companyId,
            TenentCode :formData.warehouseId,
            TenentName :formData.warehouseName,
            TenentLocation :formData.location
          }
          const url = `UserManagement/AddTenet`;

          postRequest(url,Data)
              .then((res) => {
                  if (res.status === 200) {
                    ToastSuccess("Warehouse Added Successfully");
                      props.handleOpenAddWarehouse();
                  }
              })
              .catch((error) => {
                ToastError("Entered Warehouse ID Already Exists");
                  
              });
      }

  const handleClose = () => {
    props.handleOpenAddWarehouse();
    console.log(formData)
  };

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
          <div className="dialog-title-contianer">
            <div className="dialog-icon">
              <Packageplus />
            </div>
            <Closebutton className="cursor" onClick={handleClose} />
          </div>
          <div className="dialog-title">Add Warehouse</div>
        </DialogTitle>
        <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
          <div className="grid-column-one">
            <Textfield
              label="Warehouse ID"
              name="warehouseId"
              placeholder="Enter Warehouse ID"
              onChange={handleInputChange}
            />
            {/* <div className="grid-span"> */}
              <Textfield
                label="Warehouse Name"
                name="warehouseName"
                placeholder="Enter Warehouse Name"
                rows={4}
                onChange={handleInputChange}
              />
               <Textfield
                label="Location"
                name="location"
                placeholder="Enter Location"
                rows={4}
                onChange={handleInputChange}
              />
            {/* </div> */}
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '0px 32px 32px 32px' }}>
          <button className="cancel-btn" onClick={handleAlert}>Cancel</button>
          <button className="submit-btn" onClick={handleAddwarehouse}>Submit</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddWarehouse;
