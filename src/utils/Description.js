import React from "react";

const Description = (props) => {

  const { label, value, placeholder, onChange, rows } = props;

  const handleChange = (event) => {
    onChange(label, event.target.value);
  };

  return (
    <div className="textfield-container">
      <div className="textfield-label">
        {label}
      </div>
      <div className="description-box">
        <textarea
          type="text"
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Description;