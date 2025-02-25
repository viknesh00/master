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
import { postRequest } from "../../services/ApiService";


const AddUser = (props) => {
  const [open] = useState(props.value);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});


  const handleAddUser = () => {
    debugger
          let Data = {};
          Data = { ...Data,
            CompanyId :formData.companyId,
            CompanyName :formData.companyName,
            DomainName :formData.domainName
          }
          const url = `UserManagement/AddCompanyUserManagement`;

          postRequest(url,Data)
              .then((res) => {
                  if (res.status === 200) {
                      alert("Company Added Successfully");
                      props.handleOpenAddMaterial();
                  }
              })
              .catch((error) => {
                  alert("Entered Company ID Already Exists");
                  
              });
      }

  const handleClose = () => {
    props.handleOpenAddMaterial();
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
               <Textfield
                label="User Type"
                name="userType"
                placeholder="Enter User Type"
                onChange={handleInputChange}
              />
              <Textfield
                label="Access Level"
                name="accessLevel"
                placeholder="Enter Access Level"
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
