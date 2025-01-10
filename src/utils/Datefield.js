import React, { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ReactComponent as Date } from "../assets/svg/date.svg";

const Datefield = (props) => {
  const { label, name,value, placeholder, onChange } = props;

  // State to hold the selected date
  const [selectedDate, setSelectedDate] = useState(props.value? props.value : null);

  // Reference for the DatePicker
  const datePickerRef = useRef(null);

  // Handle date change
  const handleChange = (date) => {
    setSelectedDate(date);
    // Pass the selected date back to the parent component
    onChange(name, date);
  };

  // Handle opening the date picker when the box is clicked
  const handleClick = () => {
    datePickerRef.current.setFocus();
    datePickerRef.current.setOpen(true);
  };

  return (
    <div className="textfield-container">
      <div className="textfield-label">
        {label}
      </div>
      <div className="search-box" onClick={handleClick}>
        <DatePicker
          ref={datePickerRef}
          className="cursor"
          selected={selectedDate}
          onChange={handleChange}
          placeholderText={placeholder} // Display placeholder text
          dateFormat="dd/MM/yyyy" // Optional: format for the displayed date
        />
        <Date className="cursor"/>
      </div>
    </div>
  );
};

export default Datefield;
