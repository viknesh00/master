import React, { useState } from "react";
import { ReactComponent as Plus } from "../assets/svg/plus.svg";
import { ReactComponent as Closebutton } from "../assets/svg/closebuttonsmall.svg"; 

const MultipleAdd = (props) => {
    const { placeholder, label, onChange } = props;
    const [inputValue, setInputValue] = useState("");
    const [values, setValues] = useState([]);

    const handleAdd = () => {
        if (inputValue.trim() !== "" && !values.includes(inputValue)) {
            const updatedValues = [...values, inputValue];
            setValues(updatedValues);
            setInputValue(""); // Clear the input field
            onChange(label, updatedValues); // Notify parent of the updated values
        }
    };

    const handleRemove = (valueToRemove) => {
        const updatedValues = values.filter((value) => value !== valueToRemove);
        setValues(updatedValues);
        onChange(label, updatedValues); // Notify parent of the updated values
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    return (
        <div className="textfield-container">
            <div className="textfield-label">{label}</div>
            <div className="add-box-container">
                <div className="add-box">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                </div>
                <button className="add-plus" onClick={handleAdd}>
                    <Plus />
                </button>
            </div>
            {/* Render added values as tags */}
            <div className="add-values-container">
                {values.map((value, index) => (
                    <div key={index} className="status-list">
                        <Closebutton className="cursor" onClick={() => handleRemove(value)} />
                        {value}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MultipleAdd;
