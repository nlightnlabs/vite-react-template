import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Svg from './Svg';
import * as styleFunctions from "../functions/styleFunctions.js";

import {useDispatch} from 'react-redux'
import {setTheme} from '../redux/slices/mainSlice.js'

import {config} from '../config.ts'

const HeaderNavigation = () => {

    
    const navigateTo = useNavigate();
    const [hoveredColor, setHoveredColor] = useState("")
    const [showThemeOptions, setShowThemeOptions] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<any>(null)
    const [selectedItem, setSelectedItem] = useState<any>(null)

    const themes:any = config.themes

    const dispatch = useDispatch()
    
    useEffect(()=>{
      setTimeout(()=>{
        setHoveredColor(styleFunctions.getColor("icon-hover-color"))
      },100)
    },[])

    const handleChangeTheme = (selectedTheme:string)=>{
        dispatch(setTheme(selectedTheme))
    }

    const handleSelectItem = (item:string)=>{
        setSelectedItem(item)
        navigateTo(`/${item}`)
    }


    return (
        <div className="flex relative w-[50%] justify-end z-[9999]">
            <div 
                title="Home" 
                className="icon"
                onClick={() => handleSelectItem("home")}
                onMouseOver={()=>setHoveredItem("home")}
                onMouseLeave={()=>setHoveredItem(null)}                
                >
                <Svg 
                    iconName="HomeIcon" 
                    height="30px" 
                    width="30px" 
                    fillColor={
                        hoveredItem && hoveredItem == "home" ? styleFunctions.getColor("header-menu-icon-hover-color") : 
                        selectedItem && selectedItem ==="home" ? styleFunctions.getColor("header-menu-icon-selected")
                        :styleFunctions.getColor("header-menu-icon") 
                      }
                />
            </div>

            <div 
                title="Settings" 
                className="icon" 
                onClick={() => handleSelectItem("settings")}
                onMouseOver={()=>setHoveredItem("settings")}
                onMouseLeave={()=>setHoveredItem(null)}     
                >
                <Svg 
                    iconName="SettingsIcon" 
                    height="30px" 
                    width="30px" 
                    fillColor={
                        hoveredItem && hoveredItem == "settings" ? styleFunctions.getColor("header-menu-icon-hover-color") : 
                        selectedItem && selectedItem ==="settings" ? styleFunctions.getColor("header-menu-icon-selected")
                        :styleFunctions.getColor("header-menu-icon") 
                      }
                />
            </div>

            <div className="relative flex w-auto h-auto" onMouseLeave={()=>setShowThemeOptions(false)}>
            <div 
                title="Theme" 
                className="icon" 
                onClick={() => setShowThemeOptions(true)}
                onMouseOver={()=>setHoveredItem("theme")}
                onMouseLeave={()=>setHoveredItem(null)}     
                >
                <Svg 
                    iconName="BrightnessIcon" 
                    height="30px" 
                    width="30px" 
                    fillColor={
                        hoveredItem && hoveredItem == "theme" ? styleFunctions.getColor("header-menu-icon-hover-color")
                        :styleFunctions.getColor("header-menu-icon") 
                      }
                />
                    {showThemeOptions &&
                    <div 
                        className={`absolute w-[150px] h-auto z-[999] rounded-md shadow-md right-0 choice-list p-3`}
                        onMouseLeave={()=>setShowThemeOptions(false)}
                    >{themes.length>0 && 
                        themes.map((item:any)=>(
                            <div key={item.id} className={`choice-list-item`} onClick={()=>handleChangeTheme(item.name)}>{item.label}</div>
                        ))
                    }
                        
                    </div>
                }
            </div>
            </div>

        </div>
    );
};

export default HeaderNavigation;

