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
import DropdownField from "../../utils/DropDown";
import Description from "../../utils/Description";
import SaveAlert from "../SaveAlert";
import { postRequest } from "../../services/ApiService";
import { ToastError, ToastSuccess } from "../../services/ToastMsg";


const EditUser = (props) => {
  const [open] = useState(props.value);
  const {selectedrow,selectedUserData} = props;
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});


  useEffect(() => {
    debugger
    if (selectedrow) {
      setFormData({
        "ExistUserId": selectedrow.userCode || "",
        "userId" : selectedrow.userCode || "",
        "userName": selectedrow.userName || "",
        "email": selectedrow.email || "",
        "userType": selectedrow.userType && ["Admin", "Viewer", "Contributor","QualityChecker","CollectionPointer"].includes(selectedrow.userType) 
        ? selectedrow.userType : "",
        "accessLevel": selectedrow.accessLevel || "",
        "status": selectedrow.isActive === true ? "Active" : selectedrow.isActive === false ? "Inactive" : ""
      });
    }
  }, [selectedrow]);

  const handleClose = () => {
    props.handleOpenEditUser();
    console.log(formData)
  };

  const handleAlert = () => {
    setShowAlert(prevState => !prevState);
  }

  const handleUpdate = () => {
    debugger
    if (!formData.userId || !formData.userName || !formData.email || !formData.userType) {
      ToastError("Please enter User Id,User Name, Email and UserType");
      return; // Stop further execution if validation fails
    }
    let Data = {};
     Data = {...Data,
        UserCode: formData.userId,
        UserName: formData.userName,
        UserType: formData.userType,
        AccessLevel: formData.accessLevel,
        UserStatus: formData.isActive
     }
    const url = `UserManagement/UpdateUser`;
    postRequest(url,Data)
      .then((res) => {
        if (res.status === 200) {
          ToastSuccess("User Updated Successfully");
          props.handleOpenEditUser();
        }
      })
      .catch((error) => {
        console.error(error.response.data);
      });
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
            : value === "QualityChecker"
            ? "Quality Checking Access"
            : value === "CollectionPointer"
            ? "Collection Point Access"
            : ""
          : prevData.accessLevel,
    }));
};
  

  return (
    <div>
      {showAlert && <SaveAlert value={showAlert} handleAlert={handleAlert} handleClose={handleClose} />}

      <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
        <DialogTitle sx={{ padding: '32px 32px 40px 32px' }}>
          {/* <div className="dialog-title-contianer">
            <div className="dialog-icon">
              <Packageplus />
            </div>
            <Closebutton className="cursor" onClick={handleClose} />
          </div> */}
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
              readOnly = {true}
            />
            <Textfield
              label="Email"
              value={formData.email}
              placeholder="Enter Email"
              onChange={handleInputChange}
              name="email"
              readOnly = {true}
            />
            <Textfield
              label="User Name"
              value={formData.userName}
              placeholder="Enter User Name"
              onChange={handleInputChange}
              name="userName"
            />
            <DropdownField
                label="User Type"
                name="userType"
                value={formData.userType}
                placeholder="Select User Type"
                onChange={handleInputChange}
                options={["Admin", "Viewer", "Contributor","Quality Checker"]}
            />
            <Textfield
                label="Access Level"
                name="accessLevel"
                placeholder="Enter Access Level"
                value={formData.accessLevel}
                onChange={handleInputChange}
                disabled
            />
            <DropdownField
                label="Status"
                name="status"
                value={["Active", "Inactive"].includes(formData.status) ? formData.status : ""}
                placeholder="Select User Status"
                onChange={handleInputChange}
                options={["Active", "Inactive"]}
                disabled={formData.status === null}
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
