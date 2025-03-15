import React from 'react'

interface propTypes {
  fillColor:string;
  fillOpacity:string;
}
const AddIcon = ({fillColor, fillOpacity}:propTypes) => {

const style = {
    height: "100%",
    width: "100%"
    }

  return (
    <svg 
      viewBox = "0 0 74 73"
      width="74" 
      height="73" 
      xmlns="http://www.w3.org/2000/svg"
      overflow="hidden"
      style={style}
      >
        <g transform="translate(-134 -184)"><g><g><g><g>
          <path d="M171 197C157.725 197 147 207.725 147 221 147 234.275 157.725 245 171 245 184.275 245 195 234.275 195 221 195 207.725 184.275 197 171 197ZM171 249.5C155.25 249.5 142.5 236.75 142.5 221 142.5 205.25 155.25 192.5 171 192.5 186.75 192.5 199.5 205.25 199.5 221 199.5 236.75 186.75 249.5 171 249.5Z" 
             fill={fillColor? fillColor : "lightgray"} 
             fillRule="nonzero" 
             fillOpacity={fillOpacity ? fillOpacity: "1"}
          />
          <path d="M186 215 177 215 177 206C177 204.35 175.65 203 174 203L168 203C166.35 203 165 204.35 165 206L165 215 156 215C154.35 215 153 216.35 153 218L153 224C153 225.65 154.35 227 156 227L165 227 165 236C165 237.65 166.35 239 168 239L174 239C175.65 239 177 237.65 177 236L177 227 186 227C187.65 227 189 225.65 189 224L189 218C189 216.35 187.65 215 186 215Z" 
             fill={fillColor? fillColor : "lightgray"} 
             fillRule="nonzero" 
             fillOpacity={fillOpacity ? fillOpacity: "1"}
          /></g></g></g></g></g>
        </svg>
  )
}

export default AddIcon