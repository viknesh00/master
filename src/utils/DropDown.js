import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const DropdownField = ({ label, name, value, onChange, options, disabled, placeholder }) => {

    const handleChange = (event) => {
          onChange(name, event.target.value);
      };
  return (
    <div className="textfield-container">
      <div className="textfield-label">
        {label}
      </div>
      <FormControl fullWidth>
      {!value && <InputLabel shrink={false}>{placeholder}</InputLabel>}
      <Select className="search-box-dropdown" name={name} value={options.includes(value) ? value : ""} disabled={disabled} onChange={handleChange}>
      {/* <MenuItem value="">
          {placeholder}
        </MenuItem> */}
        {options.map((option) => (
          <MenuItem key={option} value={option} disabled={option === "Select User Type"}>
            {option}
          </MenuItem>
        ))}
      </Select>
      </FormControl>
    </div>
  );
};

export default DropdownField;
