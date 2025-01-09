import React from 'react';
import { ReactComponent as InfoCircle } from "../assets/svg/info-circle.svg";
const StockCard = ({ title, value, bgColor }) => {
  return (
    <div className={`stock-card ${bgColor}`}>
      <div className="card-header">
        <span>{title}</span>
        <button><InfoCircle/></button>
      </div>
      <div className="card-body">{value}</div>
    </div>
  );
};

export default StockCard;
