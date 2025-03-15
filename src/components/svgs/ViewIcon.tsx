interface propTypes {
  fillColor:string;
  fillOpacity:string;
  hoveredColor: string;
}

const ViewIcon = ({fillColor, fillOpacity}:propTypes) => {

const style = {
    height: "100%",
    width: "100%"
    }

  return (
    <svg 
        width="98" 
        height="96" 
        xmlns="http://www.w3.org/2000/svg" 
        overflow="hidden"
        style = {style}
        >
            <g transform="translate(-526 -472)"><g><g><g><g>
                <path d="M588.9 534.4C596.7 526.9 597.1 514.5 589.7 506.5 597.6 510.6 604.1 516.9 607.9 521.1 603.9 525 597.1 530.8 588.9 534.4ZM549.6 513.8C552.9 511 556.4 508.6 560.2 506.6 552.9 514.6 553.3 526.9 561.1 534.4 552.9 530.8 546 525 542.1 521.1 544.4 518.5 546.9 516.1 549.6 513.8ZM575 536C566.2 536 559 528.8 559 520 559 511.2 566.2 504 575 504 583.8 504 591 511.2 591 520 591 528.8 583.8 536 575 536ZM613.9 518.3C608.1 511.5 592.9 496 575 496 557.1 496 541.9 511.5 536.1 518.3 534.6 520.1 534.7 522.6 536.3 524.3 542.2 530.5 557.3 544 575 544 592.7 544 607.8 530.5 613.8 524.3 615.3 522.7 615.4 520.1 613.9 518.3Z" 
                    fill={fillColor? fillColor : "white"} 
                    fillRule="nonzero" 
                    fillOpacity={fillOpacity ? fillOpacity: "1"}
                />
                
                <path d="M585 520C585 525.523 580.523 530 575 530 569.477 530 565 525.523 565 520 565 514.477 569.477 510 575 510 580.523 510 585 514.477 585 520Z" 
                    fill={fillColor? fillColor : "white"} 
                    fillRule="nonzero" 
                    fillOpacity={fillOpacity ? fillOpacity: "1"}
                /></g></g></g></g></g>
    </svg>
  )
}

export default ViewIcon