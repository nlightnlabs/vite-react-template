interface propTypes {
  fillColor:string;
  fillOpacity:string;
  hoveredColor: string;
}

const TrashIcon = ({fillColor, fillOpacity}:propTypes) => {

const style = {
    height: "100%",
    width: "100%"
    }

  return (
    <svg 
      viewBox = "0 0 97 98"
      width="97" 
      height="98" 
      xmlns="http://www.w3.org/2000/svg" 
      overflow="hidden"
      style={style}
    >
    <g transform="translate(-680 -594)"><g><g><g><g>
      <path 
        d="M759 615 742 615 742 610C742 606.1 738.9 603 735 603L723 603C719.1 603 716 606.1 716 610L716 615 699 615C696.8 615 695 616.8 695 619L695 623 763 623 763 619C763 616.8 761.2 615 759 615ZM722 610C722 609.4 722.4 609 723 609L735 609C735.6 609 736 609.4 736 610L736 615 722 615 722 610Z" 
        fill={fillColor? fillColor : "lightgray"} 
        fillRule="nonzero" 
        fillOpacity={fillOpacity ? fillOpacity: "1"}
      />
      <path 
        d="M701 679C701 681.2 702.8 683 705 683L753 683C755.2 683 757 681.2 757 679L757 627 701 627 701 679ZM742 633 748 633 748 677 742 677 742 633ZM726 633 732 633 732 677 726 677 726 633ZM710 633 716 633 716 677 710 677 710 633Z" 
        fill={fillColor? fillColor : "lightgray"} 
        fillRule="nonzero" 
        fillOpacity={fillOpacity ? fillOpacity: "1"}
      />
      </g></g></g></g></g>
      </svg>
  )
}

export default TrashIcon