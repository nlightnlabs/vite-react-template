import React, {useRef} from "react"
import { toProperCase } from "../functions/formatValue";
import Svg from "./Svg"
import * as styleFunctions from '../functions/styleFunctions'

interface propTypes{
  children?:React.ReactNode;
  title?:string;
  showHeader?:boolean;
  displayPanel: (booleanValue:boolean)=>void;
  secondaryColor?: string;
  allowDrag?:boolean;
}

const FloatingPanel = ({ children, title, showHeader=true, displayPanel, allowDrag = true}:propTypes ) => {
    
    const panelRef = useRef(null);
    const [position, setPosition] = React.useState({ x: 0.5*window.innerWidth, y: 0.5*window.innerHeight });
    const [isDragging, setIsDragging] = React.useState(false);
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });

    const handleMouseDown = (e:any) => {
      if (!allowDrag) return;
      setIsDragging(true);
      setOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    };

    const handleMouseUp = () => {
        setIsDragging(false)
    };
  
    const handleMouseMove = (e:any) => {
      if (!isDragging || !allowDrag) return;
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    };

  
    return (
      <div
        className="floating-panel"
        ref={panelRef}
        style={{
          left: position.x + "px",
          top: position.y + "px",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleMouseUp}
      >
        <div className="floating-panel-header">
          
          {showHeader && 
          <div>
            {title && toProperCase(String(title).replace(/_/g," "))}
          </div>
          }

          <div 
            title = "Close Panel"
            className="flex items-center h-[20px] w-[20px] me-2 items-self-end cursor-pointer"
            onClick={(e)=>displayPanel(false)}
          >
            <Svg 
              iconName="CloseIcon" 
              fillColor={styleFunctions.getColor("icon")}
              hoveredColor={styleFunctions.getColor("icon-hover")}
            />
          </div>

        </div>

        <div className="floating-panel-body">
          {children}
        </div>
        
      </div>
    );
  };

  export default FloatingPanel