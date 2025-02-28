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


const AddCompany = (props) => {
  const [companyData] = props;
  const [open] = useState(props.value);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});


  const handleAddcompany = () => {
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
                      props.handleOpenAddCompany();
                  }
              })
              .catch((error) => {
                  alert("Entered Company ID Already Exists");
                  
              });
      }

  const handleClose = () => {
    props.handleOpenAddCompany();
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
          <div className="dialog-title">Add Company</div>
        </DialogTitle>
        <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
          <div className="grid-column-one">
            <Textfield
              label="Company ID"
              name="companyId"
              placeholder="Enter Company ID"
              onChange={handleInputChange}
            />
            {/* <div className="grid-span"> */}
              <Textfield
                label="Company Name"
                name="companyName"
                placeholder="Enter Company Name"
                onChange={handleInputChange}
              />
               <Textfield
                label="Domain Name"
                name="domainName"
                placeholder="Enter Domain Name"
                rows={4}
                onChange={handleInputChange}
              />
            {/* </div> */}
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '0px 32px 32px 32px' }}>
          <button className="cancel-btn" onClick={handleAlert}>Cancel</button>
          <button className="submit-btn" onClick={handleAddcompany}>Submit</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddCompany;
