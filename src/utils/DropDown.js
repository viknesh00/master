import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const DropdownField = ({ label, name, value, onChange, options, disabled }) => {

    const handleChange = (event) => {
          onChange(name, event.target.value);
      };
  return (
    <div className="textfield-container">
      <div className="textfield-label">
        {label}
      </div>
      <Select className="search-box-dropdown" name={name} value={options.includes(value) ? value : ""} disabled={disabled} onChange={handleChange}>
        {options.map((option) => (
          <MenuItem key={option} value={option} disabled={option === "Select User Type"}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default DropdownField;
