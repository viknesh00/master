import React from "react";

const Textfield = (props) => {
  const { label, value, name, placeholder, onChange, readOnly, type, required } = props;

  const handleChange = (event) => {
    // 
    if (!readOnly) {
      onChange(name, event.target.value);
    }
  };

  return (
    <div className="textfield-container">
      <div className="textfield-label">
        {label}
        {required && <span className="error">*</span>}
      </div>
      <div className="search-box">
        <input
          type={type || "text"}
          value={value}
          name={name}
          placeholder={placeholder}
          onChange={handleChange}
          readOnly={readOnly}
          required={required || false}
        />
      </div>
    </div>
  );
};

export default Textfield;


// useEffect(() => {
//   console.log("Form Data Updated:", formData);
// }, [formData]);

// const [formData, setFormData] = useState({});

// const handleInputChange = (label, value) => {
//   setFormData((prevData) => ({
//       ...prevData,
//       [label]: value,
//   }));
// };

// <Textfield
//                 label="Delivery Number"
//                 placeholder="Enter Delivery Number"
//                 onChange={handleInputChange}
//             />