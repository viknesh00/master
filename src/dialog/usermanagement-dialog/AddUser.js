import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { ReactComponent as Packageplus } from "../../assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "../../assets/svg/closebutton.svg";
import Textfield from "../../utils/Textfield";
import DropdownField from "../../utils/DropDown";
import Description from "../../utils/Description";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";
import { Password } from "@mui/icons-material";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";


const AddUser = (props) => {
  const location = useLocation();
  const WarehouseId = location.pathname.split('/').pop();
  const [open] = useState(props.value);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    userType: "",
    accessLevel: "",
    password: "Natoasset@123"
  });


  const handleAddUser = () => {
    debugger
          let Data = {};
          Data = { ...Data,
            UserCode :parseInt(formData.userId),
            UserName :formData.userName,
            Email :formData.email,
            UserType :formData.userType,
            accessLevel: formData.accessLevel,
            Password: formData.password,
            TenentCode: WarehouseId
          }
          const url = `UserManagement/AddUser`;

          postRequest(url,Data)
              .then((res) => {
                  if (res.status === 200) {
                    ToastSuccess("User Added Successfully");
                      props.handleOpenAddUser();
                  }
              })
              .catch((error) => {
                ToastError("Entered User ID Already Exists");
                  
              });
      }

  const handleClose = () => {
    props.handleOpenAddUser();
    console.log(formData)
  };

  const handleAlert = () => {   
    setShowAlert(prevState => !prevState);
}



  const handleInputChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      accessLevel:
        name === "userType"
          ? value === "Admin"
            ? "Admin role"
            : value === "Viewer"
            ? "Read-only access"
            : value === "Contributor"
            ? "Read and write access"
            : ""
          : prevData.accessLevel,
    }));
  };

  return (
    <div>
      {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}
      <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
        <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
          <div className="dialog-title-contianer">
            <div className="dialog-icon">
              <Packageplus />
            </div>
            <Closebutton className="cursor" onClick={handleClose} />
          </div>
          <div className="dialog-title">Add User</div>
        </DialogTitle>
        <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
          <div className="grid-column">
            <Textfield
              label="User ID"
              name="userId"
              placeholder="Enter User ID"
              onChange={handleInputChange}
            />
              <Textfield
                label="User Name"
                name="userName"
                placeholder="Enter User Name"
                onChange={handleInputChange}
              />
               <Textfield
                label="Email"
                name="email"
                placeholder="Enter Email"
                rows={4}
                onChange={handleInputChange}
              />
               <DropdownField
                label="User Type"
                name="userType"
                value={formData.userType}
                placeholder="Select User Type"
                onChange={handleInputChange}
                options={["Select User Type","Admin", "Viewer", "Contributor"]}
              />
              <Textfield
                label="Access Level"
                name="accessLevel"
                placeholder="Enter Access Level"
                value={formData.accessLevel}
                onChange={handleInputChange}
                disabled
              />
              <Textfield
                label="Password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            {/* </div> */}
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '0px 32px 32px 32px' }}>
          <button className="cancel-btn" onClick={handleAlert}>Cancel</button>
          <button className="submit-btn" onClick={handleAddUser}>Submit</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddUser;
