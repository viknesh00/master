import React, { useState, useEffect } from "react";
import { ReactComponent as DownArrow } from "../assets/svg/optiondown-arrow.svg";
import { ReactComponent as UpArrow } from "../assets/svg/optionup-arrow.svg";

const CustomSelect = ({ label, options, placeholder, onSelectionChange, resetSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  // Reset selected option when resetSelect prop is true
  useEffect(() => {
    if (resetSelect) {
      setSelectedOption(null);
    }
  }, [resetSelect]);

  // Filter options based on search term
  const filteredOptions = options
  .filter((option) => option?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Handle input change for search term
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true); // Show dropdown when user starts typing
    onSelectionChange(value);
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onSelectionChange(option, "inwardFrom"); // Notify parent about selection
    setSearchTerm(""); // Clear search term after selection
    setShowDropdown(false); // Close dropdown after selection
  };

  // Toggle dropdown visibility on input field click
  const handleClick = () => setShowDropdown(prevState => !prevState);

  // Close dropdown if input field loses focus
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
