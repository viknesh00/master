import React from "react";
import { ReactComponent as SearchIcon } from "../assets/svg/search.svg";

const Search = (props) => {

  const {placeholder, onChange } = props;

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className="textfield-container">
      <div className="search-box-container">
        <SearchIcon/>
        <input
          type="text"
          placeholder={placeholder}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Search;