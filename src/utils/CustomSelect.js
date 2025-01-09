import React, { useState, useEffect } from "react";
import { ReactComponent as DownArrow } from "../assets/svg/optiondown-arrow.svg";
import { ReactComponent as UpArrow } from "../assets/svg/optionup-arrow.svg";

const CustomSelect = ({ label, options, placeholder, onSelectionChange, resetSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (resetSelect) {
      setSelectedOption(null); // Reset selected option when resetSelect is true
    }
  }, [resetSelect]);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onSelectionChange(option, "inwardFrom"); // Notify parent about the selection
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleClick = () => setShowDropdown(prevState =>(!prevState));

 
  const handleBlur = (e) => {
    const relatedTarget = e.relatedTarget;
    if (
      relatedTarget &&
      (relatedTarget.classList.contains("dropdown") ||
        relatedTarget.classList.contains("dropdown-item"))
    ) {
      return;
    }
    setShowDropdown(false);
  };

  return (
    <div className="customselect-container">
      <div className="textfield-label">{label}</div>
      <div className="date-box" onClick={handleClick}>
        <input
          type="text"
          value={searchTerm || (selectedOption ? selectedOption.name : "")}
          onChange={handleSearch}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="custom-input"
        />
        {/* Toggle Arrow Icon */}
        {showDropdown ? (
  <UpArrow className="cursor" key="up-arrow" />
) : (
  <DownArrow className="cursor" key="down-arrow" />
)}
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className={`dropdown-item ${
                  selectedOption && selectedOption.id === option.id ? "selected" : ""
                }`}
                onClick={() => handleOptionSelect(option)}
                tabIndex="0" // Make dropdown items focusable
              >
                {option.name}
              </div>
            ))
          ) : (
            <div className="dropdown-item">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
