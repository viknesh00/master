import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ReactComponent as DateIcon } from "../assets/svg/date.svg";

const Datefield = (props) => {
  const { label, name, value, placeholder, onChange } = props;

  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const datePickerRef = useRef(null);

  useEffect(() => {
  if (!value && selectedDate) {
    onChange(name, selectedDate);   // ✅ push default to parent
  }
}, []);

  // ✅ Sync when parent value changes
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
    }
  }, [value]);

  const handleChange = (date) => {
    setSelectedDate(date);
    onChange(name, date);
  };

  const handleClick = () => {
    datePickerRef.current.setFocus();
    datePickerRef.current.setOpen(true);
  };

  return (
    <div className="textfield-container">
      <div className="textfield-label">{label}</div>

      <div className="search-box" onClick={handleClick}>
        <DatePicker
          ref={datePickerRef}
          className="cursor"
          selected={selectedDate}
          onChange={handleChange}
          placeholderText={placeholder}
          dateFormat="dd/MM/yyyy"
        />
        <DateIcon className="cursor" />
      </div>
    </div>
  );
};

export default Datefield;