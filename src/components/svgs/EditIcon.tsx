import {useState} from "react";

interface propTypes {
  fillColor:string;
  fillOpacity:string;
  hoveredColor: string;
}

const EditIcon = ({fillColor, fillOpacity}:propTypes) => {

const style = {
    height: "100%",
    width: "100%"
    }

  return (
    <svg 
        viewBox = "0 0 72 73"
        width="72" 
        height="73" 
        xmlns="http://www.w3.org/2000/svg" 
        overflow="hidden"
        style={style}
        >
            <g transform="translate(-328 -184)"><g><g><g><g>
                <path d="M346.75 238.325C348.25 239.825 348.25 242.15 346.75 243.65L340.375 245.75 339.25 244.625 341.35 238.25C342.925 236.825 345.25 236.825 346.75 238.325ZM376.225 199.175 338.725 236.75 334 251 348.325 246.275 385.825 208.775" 
                    fill={fillColor? fillColor : "lightgray"} 
                    fillRule="nonzero" 
                    fillOpacity={fillOpacity ? fillOpacity: "1"}
                />
                
                <path d="M393.175 197.15 387.85 191.825C386.65 190.625 384.775 190.625 383.575 191.825L378.325 197.075 387.85 206.6 393.1 201.35C394.375 200.225 394.375 198.35 393.175 197.15Z" 
                    fill={fillColor? fillColor : "lightgray"} 
                    fillRule="nonzero" 
                    fillOpacity={fillOpacity ? fillOpacity: "1"}
            /></g></g></g></g></g>
    </svg>
  )
}

export default EditIcon