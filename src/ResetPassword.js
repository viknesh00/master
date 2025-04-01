import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Packageplus } from "././assets/svg/packageplus.svg";
import { ReactComponent as Closebutton } from "././assets/svg/closebutton.svg";
import Textfield from "././utils/Textfield";
import { postRequest } from "././services/ApiService";
import { ToastError, ToastSuccess } from "./services/ToastMsg";

export default function ResetPassword(props){
    const {username} = props;
      const [open] = useState(props.value);  
      const [formData, setFormData] = useState({});
      //const [showAlert, setShowAlert] = useState(false);
      const navigate = useNavigate();
    
      const handleClose = () => {
        props.handleClose();
      };
    
      const handlePrevent = () => {
        props.handleAlert();
      }

      const handleResetPassword =()=>{
        debugger
        if (formData.newPassword !== formData.confirmPassword) {
          ToastError("New Password and Confirm Password do not match!");
            return;
        }
        let Data = {};
        Data = {
            ...Data,
            Email: username,
            ExistPassword: formData.existPassword,
            NewPassword: formData.newPassword,
        }
                  const url = `Login/ResetPassword`;
        
                  postRequest(url,Data)
                      .then((res) => {
                          if (res.status === 200) {
                            ToastSuccess("Password Updated Successfully");
                              handleClose();
                              navigate("/dashboard");
                          }
                      })
                      .catch((error) => {
                        ToastError("Password does not match With Confirm Password");
                          
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
            <div className="dialog-icon">
              <Packageplus />
            </div>
            <Closebutton className="cursor" onClick={handleClose} />
          </div>
          <div className="dialog-title">Reset Password</div>
        </DialogTitle>
        <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
          <div className="grid-column-one">
          <Textfield
                label="Exist Password"
                name="existPassword"
                placeholder="Enter Exist Password"
                onChange={handleInputChange}
              />
                <Textfield
                label="New Password"
                name="newPassword"
                placeholder="Enter New password"
                onChange={handleInputChange}
              />
                <Textfield
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Enter Confirm password"
                onChange={handleInputChange}
              />
            {/* </div> */}
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '0px 32px 32px 32px' }}>
          <button className="cancel-btn" onClick={handlePrevent}>Cancel</button>
          <button className="submit-btn" onClick={handleResetPassword}>Submit</button>
        </DialogActions>
      </Dialog>
    </div>
    )
}

// resetPassword;