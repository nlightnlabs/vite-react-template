interface propTypes {
  fillColor:string;
  fillOpacity:string;
  hoveredColor: string;
}

const GenerateIcon = ({fillColor, fillOpacity}:propTypes) => {

const style = {
    height: "100%",
    width: "100%",
    }

  return (
    <svg 
      viewBox="5 0 20 20"  
      xmlns="http://www.w3.org/2000/svg" 
      overflow="hidden"
      style = {style}
      >
    <path 
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.0614 9.67972L16.4756 11.0939L17.8787 9.69083L16.4645 8.27662L15.0614 9.67972ZM16.4645 6.1553L20 9.69083L8.6863 21.0045L5.15076 17.469L16.4645 6.1553Z" 
      fill={fillColor? fillColor : "white"} 
      fillOpacity={fillOpacity ? fillOpacity: "1"}
    />
    <path 
      fillRule="evenodd"
      clipRule="evenodd"
      fill={fillColor? fillColor : "white"} 
      fillOpacity={fillOpacity ? fillOpacity: "1"}
      d="M11.364 5.06066L9.59619 6.82843L8.53553 5.76777L10.3033 4L11.364 5.06066ZM6.76778 6.82842L5 5.06067L6.06066 4L7.82843 5.76776L6.76778 6.82842ZM10.3033 10.364L8.53553 8.5962L9.59619 7.53554L11.364 9.3033L10.3033 10.364ZM7.82843 8.5962L6.06066 10.364L5 9.3033L6.76777 7.53554L7.82843 8.5962Z" 
    />
    </svg>
  )
}

export default GenerateIcon