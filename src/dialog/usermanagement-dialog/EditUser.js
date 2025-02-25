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


const EditUser = (props) => {
  const [open] = useState(props.value);
  const {selectedrow,selectedcompanyData} = props;
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});


  useEffect(() => {
    debugger
    if (selectedrow) {
      setFormData({
        "ExistCompanyId": selectedrow.pk_CompanyCode || "",
        "companyId" : selectedrow.pk_CompanyCode || "",
        "companyName": selectedrow.companyName || "",
        "domainName": selectedrow.domainName || "",
      });
    }
  }, [selectedrow]);

  const handleClose = () => {
    props.handleOpenEditMaterial();
    console.log(formData)
  };

  const handleAlert = () => {
    setShowAlert(prevState => !prevState);
  }

  const handleUpdate = () => {
    debugger
    let Data = {};
     Data = {...Data,
        ExistCompanyId: selectedcompanyData.pk_CompanyCode,
        CompanyId: formData.companyId,
        CompanyName: formData.companyName,
        DomainName: formData.domainName
     }
    const url = `UserManagement/UpdateCompanyUserManagement`;
    postRequest(url,Data)
      .then((res) => {
        if (res.status === 200) {
          alert("User Updated Successfully");
          props.handleOpenEditMaterial();
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

      <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
        <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
          <div className="dialog-title-contianer">
            <div className="dialog-icon">
              <Packageplus />
            </div>
            <Closebutton className="cursor" onClick={handleClose} />
          </div>
          <div className="dialog-title">Update User</div>
        </DialogTitle>
        <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
          <div className="grid-column">
            <Textfield
              label="User ID"
              value={formData.userId}
              placeholder="Enter User ID"
              onChange={handleInputChange}
              name="userId"
            />
            <Textfield
              label="User Name"
              value={formData.userName}
              placeholder="Enter User Name"
              onChange={handleInputChange}
              name="userName"
            />
            <Textfield
              label="Email"
              value={formData.email}
              placeholder="Enter Email"
              onChange={handleInputChange}
              name="email"
            />
            <Textfield
              label="User Type"
              value={formData.userType}
              placeholder="Enter user Type"
              onChange={handleInputChange}
              name="userType"
            />
             <Textfield
              label="Access Level"
              value={formData.domainName}
              placeholder="Enter Access Level"
              onChange={handleInputChange}
              name="accessLevel"
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

export default EditUser;
