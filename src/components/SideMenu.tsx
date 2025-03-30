import {useState, useEffect} from 'react';
import Svg from './Svg.js'
import { useNavigate } from 'react-router-dom';
import * as styleFunctions from '../functions/styleFunctions.js'
import {config} from '../config.ts'
import { useDispatch } from 'react-redux';
import { setCurrentModule, setCurrentPath } from '../redux/slices/mainSlice.ts';

const SideMenu = () => {

  const [showMenu, setShowMenu] = useState(true)
  const [menuItems, setMenuItems] = useState<any>([])
  const [sections, setSections] = useState<any>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [expanded, setExpanded] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<any>()
 
  const getMenuItems = ()=>{
    const menuItemsArray = config.sideMenuItems
    setMenuItems(menuItemsArray)

    const sectionSet = [...new Set(menuItemsArray.map((item:any)=>item.section))]
    setSections(sectionSet)
  }

  useEffect(()=>{
      getMenuItems()
  },[])

  const navigateTo = useNavigate()
  
  const dispatch = useDispatch()

  const handleSelect = (selectedModule:any)=>{
    setSelectedItem(selectedModule)
    dispatch(setCurrentModule(selectedModule))
    dispatch(setCurrentPath(`/${selectedModule.link}`));
    navigateTo(`/${selectedModule.link}`)
  }

  useEffect(()=>{
    if(expanded){
      setTimeout(()=>{
        setShowMenu(true)
      },100)
    }else{
      setShowMenu(false)
    }
  },[expanded])


  return (

    <div
    className="side-menu"
    style={!expanded ? {minWidth: "50px"} : {minWidth: "200px"}}
  >

  <div className="flex w-full">
    <div 
      className="flex h-[30px] w-[30px] cursor-pointer transition duration-500"
      style={expanded ? {transform: "scaleX(-1)"} :{transform: "scaleX(1)"}}
      onClick={()=>setExpanded(!expanded)}
      title={expanded? "Collapse Menu" : "Expand Menu"}
    >
       <Svg
        iconName="AngleArrowIcon"
        fillColor={styleFunctions.getColor("side-menu-icon")}
      />
    </div>
  </div>

  {showMenu && menuItems.length>0 &&
    sections.length>0 && sections.map((section:any, index:number)=>(
      <div key={index+1} className="side-menu-section fade-in">

        {section.length > 1 && <label className="side-menu-label">{section}</label>}
        
        {menuItems.map((item:any)=>(
          item.section===section && 
            <div 
              key={item.id}
              className={selectedItem && selectedItem.id ===item.id ? "side-menu-item-selected": "side-menu-item"}
              onClick={()=>handleSelect(item)}
              onMouseOver={()=>setHoveredItem(item)}
              onMouseLeave={()=>setHoveredItem(null)}
            >
              {item.icon_name && 
                <Svg
                  iconName={item.icon_name}
                  fillColor={
                      hoveredItem && hoveredItem.id == item.id ? styleFunctions.getColor("side-menu-icon-hover-color") : 
                      selectedItem && selectedItem.id ===item.id ? styleFunctions.getColor("side-menu-item-selected")
                      :styleFunctions.getColor("side-menu-icon") 
                    }
                  height="35px"
                  width="35px"
                />
              }
              <span className="side-menu-label ms-1">{item.label}</span>
              
              </div>
          ))
        }
      </div>
    

    ))
  }
</div>
    
  );
};

export default SideMenu;