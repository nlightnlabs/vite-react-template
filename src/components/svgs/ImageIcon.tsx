import {useState} from "react";

interface propTypes {
  fillColor:string;
  fillOpacity:string;
  hoveredColor: string;
}

const ImageIcon = ({fillColor, fillOpacity, hoveredColor}:propTypes) => {

    const style = {
        height: "100%",
        width: "100%",
        transition: "All 2s ease-in-out"
      }

    const[hovered, setHovered] = useState(false)
      
  return (
    <svg 
        viewBox="0 0 73 74"
        width="73" 
        height="74" 
        xmlns="http://www.w3.org/2000/svg" 
        overflow="hidden"
        style={style}
        onMouseOver={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
    ><g 
        transform="translate(-884 -286)"><g><g><g><g>
            <path
             d="M939 340.7 928.732 324.335C928.549 324.035 928.222 323.853 927.87 323.855 927.517 323.855 927.188 324.036 927 324.335L924 329.15 930.435 339.56C930.98 340.384 931.097 341.418 930.75 342.342L938.025 342.342C938.621 342.372 939.128 341.913 939.157 341.318 939.168 341.101 939.113 340.885 939 340.7Z" 
             fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"} 
             fillRule="nonzero" 
             fillOpacity={fillOpacity? fillOpacity: "1"}
             />
             <path 
             d="M927.825 340.798 911.513 314.255C911.303 313.985 910.977 313.831 910.635 313.842L910.5 313.842 910.365 313.842C910.023 313.831 909.697 313.985 909.487 314.255L893.175 340.798C892.944 341.121 892.912 341.546 893.093 341.9 893.274 342.221 893.635 342.397 894 342.342L927 342.342C927.365 342.397 927.726 342.221 927.907 341.9 928.088 341.546 928.056 341.121 927.825 340.798ZM913.23 326.69 910.635 329 908.04 326.69 903.75 329.285 910.5 318.342 917.07 329Z" 
             fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"}  
             fillRule="nonzero" 
             fillOpacity={fillOpacity? fillOpacity: "1"}
             />
             <path 
                d="M903 315.5C903 316.743 901.993 317.75 900.75 317.75 899.507 317.75 898.5 316.743 898.5 315.5 898.5 314.257 899.507 313.25 900.75 313.25 901.993 313.25 903 314.257 903 315.5Z"
                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"} 
                fillRule="nonzero" 
                fillOpacity={fillOpacity? fillOpacity: "1"}
                />
            <path 
                d="M954.75 296.75 894.75 296.75 894.75 305 886.5 305 886.5 351.342 946.5 351.342 946.5 343.092 954.75 343.092ZM942 347 891 347 891 309.342 942 309.342ZM950.25 338.75 946.5 338.75 946.5 305 899.25 305 899.25 301.25 950.25 301.25Z" 
                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"} 
                fillRule="nonzero" 
                fillOpacity={fillOpacity? fillOpacity: "1"}
            /></g></g></g></g></g>
        </svg>
  )
}

export default ImageIcon;

