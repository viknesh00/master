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
import { ToastError, ToastSuccess } from "../../services/ToastMsg";
import { useUser } from "../../UserContext.js";

const EditMaterial = (props) => {
  const [open] = useState(props.value);
  const {selectedrow} = props;
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({});
  const { name  } = useUser();

  useEffect(() => {
    if (selectedrow) {
      setFormData({
        "ExistingNumber" : selectedrow.materialNumber || "",
        "MaterialNumber": selectedrow.materialNumber || "",
        "MaterialDescription": selectedrow.materialDescription || "",
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
    if (!formData.MaterialNumber || !formData.MaterialDescription) {
      ToastError("Please enter the Material Number and Material Description");
      return;
    };
    let data = {
      userName: name,
      existMaterialNumber: formData.ExistingNumber,
      materialNumber: formData.MaterialNumber,
      materialDescription: formData.MaterialDescription
    }
    const url = `SmInboundStockCiis/update`;
    postRequest(url,data)
      .then((res) => {
        if (res.status === 200) {
          ToastSuccess("Material Updated Successfully");
          props.handleOpenEditMaterial();
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        //ToastError(error.response.data);
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
          <div className="dialog-title">Update Material</div>
        </DialogTitle>
        <DialogContent sx={{ padding: '0px 32px 40px 32px' }}>
          <div className="grid-column">
            <Textfield
              label="Material Number"
              value={formData.MaterialNumber}
              placeholder="Enter Material Number"
              onChange={handleInputChange}
              name="MaterialNumber"
              readOnly = {true}
            />
            <div className="grid-span">
              <Description
                label="Material Description"
                value={formData.MaterialDescription}
                placeholder="Enter Material Description"
                rows={4}
                onChange={handleInputChange}
                name="MaterialDescription"
              />
            </div>

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

export default EditMaterial;
