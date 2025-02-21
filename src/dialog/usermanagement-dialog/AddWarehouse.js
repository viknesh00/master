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


const AddWarehouse = (props) => {
  const [open] = useState(props.value);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});


  const handleAddwarehouse = () => {
        //   const url = `SmInboundStockNonCiis/NonStockCIIMaterial/${formData.MaterialNumber}/${formData.MaterialDescription}`;
  
        //   postRequest(url)
        //       .then((res) => {
        //           if (res.status === 200) {
        //               alert("Material Added Successfully");
        //               props.handleOpenAddMaterial();
        //           }
        //       })
        //       .catch((error) => {
        //           alert("Entered Material Number Already Exists");
                  
        //       });
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
              name="MaterialNumber"
              placeholder="Enter Warehouse ID"
              onChange={handleInputChange}
            />
            {/* <div className="grid-span"> */}
              <Textfield
                label="Warehouse Name"
                name="MaterialDescription"
                placeholder="Enter Warehouse Name"
                rows={4}
                onChange={handleInputChange}
              />
               <Textfield
                label="Location"
                name="MaterialDescription"
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
