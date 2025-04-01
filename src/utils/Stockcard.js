import React from 'react';
import { ReactComponent as InfoCircle } from "../assets/svg/info-circle.svg";
import { CircularProgressbarWithChildren, CircularProgressbar, buildStyles } from "react-circular-progressbar";
const StockCard = ({ title, value, bgColor, onClick  }) => {
  return (
    <div className="flex flex-col items-center" onClick={onClick}>
      <div className="w-32 h-32 cursor-pointer" >
        <CircularProgressbarWithChildren
          value={100}
          styles={{
            path: { stroke: bgColor },
            trail: { stroke: bgColor },
          }}
        >
          <div className="text-center">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="font-semibold text-lg">{value}</p>
          </div>
        </CircularProgressbarWithChildren>
      </div>
    </div>
  );
};

export default StockCard;
