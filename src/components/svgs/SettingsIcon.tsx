import {useState} from "react"

interface propTypes {
    fillColor:string;
    fillOpacity:string;
    hoveredColor: string;
  }

const SettingsIcon = ({fillColor, fillOpacity, hoveredColor}:propTypes) => {

    const style = {
        height: "100%",
        width: "100%",
        transition: "all 2s ease-in-out"
      }

    const[hovered, setHovered] = useState(false)

    return (
        <svg
            viewBox = "0 0 75 75"
            width="75" 
            height="75" 
            xmlns="http://www.w3.org/2000/svg" 
            overflow="hidden"
            style={style}
            onMouseOver={()=>setHovered(true)}
            onMouseLeave={()=>setHovered(false)}
            >
                <g transform="translate(-336 -97)"><g><g><g><g>
                    
                    <path 
                        d="M372 143C367.05 143 363 138.95 363 134 363 129.05 367.05 125 372 125 376.95 125 381 129.05 381 134 381 138.95 376.95 143 372 143ZM392.25 128.375C391.8 126.725 391.125 125.15 390.3 123.725L392.175 118.1 387.9 113.825 382.275 115.7C380.775 114.875 379.2 114.2 377.55 113.75L375 108.5 369 108.5 366.375 113.75C364.725 114.2 363.15 114.875 361.725 115.7L356.1 113.825 351.825 118.1 353.7 123.725C352.875 125.225 352.2 126.8 351.75 128.45L346.5 131 346.5 137 351.75 139.625C352.2 141.275 352.875 142.85 353.7 144.275L351.825 149.9 356.1 154.175 361.725 152.3C363.225 153.125 364.8 153.8 366.45 154.25L369.075 159.5 375.075 159.5 377.7 154.25C379.35 153.8 380.925 153.125 382.35 152.3L387.975 154.175 392.25 149.9 390.375 144.275C391.2 142.775 391.875 141.2 392.325 139.55L397.575 136.925 397.575 130.925 392.25 128.375Z" 
                        fill={
                            hoveredColor && hovered ? hoveredColor
                            :fillColor && !hovered ? fillColor
                            :fillColor
                        } 
                        fillRule="nonzero" 
                        fillOpacity={fillOpacity ? fillOpacity: "1"}
                    /></g></g></g></g></g>
        </svg>
    )
  }
  
  export default SettingsIcon

