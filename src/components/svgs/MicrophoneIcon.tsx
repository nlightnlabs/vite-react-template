interface propTypes {
  fillColor:string;
  fillOpacity:string;
  hoveredColor: string;
}

const MicrophoneIcon = ({fillColor, fillOpacity}:propTypes) => {

const style = {
    height: "100%",
    width: "100%"
    }

  return (
    <svg 
      viewBox="0 0 73 74"
      width="73" 
      height="74" 
      xmlns="http://www.w3.org/2000/svg" 
      overflow="hidden"
      style={style}
      >
      <g transform="translate(-164 -310)"><g><g><g><g>
        <path d="M203.25 375.5 203.25 366.35C211.725 365.225 218.25 358.025 218.25 349.25L218.25 341.75 213.75 341.75 213.75 349.25C213.75 356.3 208.05 362 201 362 193.95 362 188.25 356.3 188.25 349.25L188.25 341.75 183.75 341.75 183.75 349.25C183.75 358.025 190.275 365.225 198.75 366.35L198.75 375.5 183 375.5 183 380 219 380 219 375.5 203.25 375.5Z" 
        fill={fillColor? fillColor : "white"} 
        fillRule="nonzero" 
        fillOpacity={fillOpacity ? fillOpacity: "1"}
      />
      <path d="M201 359C206.4 359 210.75 354.65 210.75 349.25L203.25 349.25 203.25 346.25 210.75 346.25 210.75 341.75 203.25 341.75 203.25 338.75 210.75 338.75 210.75 334.25 203.25 334.25 203.25 331.25 210.75 331.25 210.75 326.75 203.25 326.75 203.25 323.75 210.75 323.75C210.75 318.35 206.4 314 201 314 195.6 314 191.25 318.35 191.25 323.75L191.25 349.25C191.25 354.65 195.6 359 201 359Z" 
        fill={fillColor? fillColor : "white"} 
        fillRule="nonzero" 
        fillOpacity={fillOpacity ? fillOpacity: "1"}
      /></g></g></g></g></g>
    </svg>
  )
}

export default MicrophoneIcon