import { useState, useEffect } from 'react';
import '../i18n';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';
import Svg from './Svg';
import * as styleFunctions from "../functions/styleFunctions.js";

import {useDispatch, useSelector} from 'react-redux'
import {setTheme, setLanguage, setCurrentPath} from '../redux/slices/mainSlice.js'

import {config} from '../config.ts'

const HeaderNavigation = () => {

    const { t, i18n } = useTranslation("languages");
    const langauge = useSelector((state:any) => state.main.language)

    const navigateTo = useNavigate();
    const [hoveredColor, setHoveredColor] = useState("")
    const [showThemeOptions, setShowThemeOptions] = useState(false)
    const [showLanguageOptions, setShowLanguageOptions] = useState(false)
    const [hoveredTheme, setHoveredTheme] = useState<any>(null)
    const [selectedTheme, setSelectedTheme] = useState<any>(null)
    const [hoveredLanguage, setHoveredLanguage] = useState<any>(null)

    const themes:any = config.themes
    const languages:any = config.languages

    const dispatch = useDispatch()
    
    useEffect(()=>{
      setTimeout(()=>{
        setHoveredColor(styleFunctions.getColor("icon-hover-color"))
      },100)
    },[])

    const handleChangeTheme = (selectedTheme:string)=>{
        dispatch(setTheme(selectedTheme))
        setHoveredTheme(null)
        setShowThemeOptions(false)
    }

    const handleChangeLanguage = (selectedLang: string) => {
        i18n.changeLanguage(selectedLang);
        dispatch(setLanguage(selectedLang));
      };

        
    const handleSelectItem = (item:string)=>{
        setSelectedTheme(item)
        dispatch(setCurrentPath(`/${item}`));
        navigateTo(`/${item}`)
    }


    return (
        <div className="flex relative w-[50%] justify-end z-[9999]">
            <div 
                title="Home" 
                className="icon"
                onClick={() => handleSelectItem("home")}
                onMouseOver={()=>setHoveredTheme("home")}
                onMouseLeave={()=>setHoveredTheme(null)}                
                >
                <Svg 
                    iconName="HomeIcon" 
                    height="30px" 
                    width="30px" 
                    fillColor={
                        hoveredTheme && hoveredTheme == "home" ? styleFunctions.getColor("header-menu-icon-hover-color") : 
                        selectedTheme && selectedTheme ==="home" ? styleFunctions.getColor("header-menu-icon-selected")
                        :styleFunctions.getColor("header-menu-icon") 
                      }
                />
            </div>

            <div 
                title="Settings" 
                className="icon" 
                onClick={() => handleSelectItem("settings")}
                onMouseOver={()=>setHoveredTheme("settings")}
                onMouseLeave={()=>setHoveredTheme(null)}     
                >
                <Svg 
                    iconName="SettingsIcon" 
                    height="30px" 
                    width="30px" 
                    fillColor={
                        hoveredTheme && hoveredTheme == "settings" ? styleFunctions.getColor("header-menu-icon-hover-color") : 
                        selectedTheme && selectedTheme ==="settings" ? styleFunctions.getColor("header-menu-icon-selected")
                        :styleFunctions.getColor("header-menu-icon") 
                      }
                />
            </div>

            <div className="relative flex w-auto h-auto" onMouseLeave={()=>setShowThemeOptions(false)}>
            <div 
                title="Theme" 
                className="icon" 
                onClick={() => setShowThemeOptions(true)}
                onMouseOver={()=>setHoveredTheme("theme")}
                onMouseLeave={()=>setHoveredTheme(null)}     
                >
                <Svg 
                    iconName="BrightnessIcon" 
                    height="30px" 
                    width="30px" 
                    fillColor={
                        hoveredTheme && hoveredTheme == "theme" ? styleFunctions.getColor("header-menu-icon-hover-color")
                        :styleFunctions.getColor("header-menu-icon") 
                      }
                />
                    {showThemeOptions &&
                    <div 
                        className={`absolute w-[150px] h-auto z-[999] rounded-md shadow-md right-0 choice-list p-3`}
                        onMouseLeave={()=>setShowThemeOptions(false)}
                    >{themes.length>0 && 
                        themes.map((item:any)=>(
                            <div 
                                key={item.id} className={`choice-list-item`} 
                                onClick={()=>handleChangeTheme(item.name)}>{item.label}
                            </div>
                        ))
                    }
                        
                    </div>
                }

            
            </div>
            </div>


            <div className="relative flex w-auto h-auto" onMouseLeave={()=>setShowLanguageOptions(false)}>
            <div 
                title="Language" 
                className="icon" 
                onClick={() => setShowLanguageOptions(true)}
                onMouseOver={()=>setHoveredLanguage("language")}
                onMouseLeave={()=>setHoveredLanguage(null)}     
                >
                <Svg 
                    iconName="LocalizeIcon" 
                    height="30px" 
                    width="30px" 
                    fillColor={
                        hoveredLanguage && hoveredLanguage == "theme" ? styleFunctions.getColor("header-menu-icon-hover-color")
                        :styleFunctions.getColor("header-menu-icon") 
                      }
                />
                    {showLanguageOptions &&
                    <div 
                        className={`absolute w-[150px] h-auto z-[999] rounded-md shadow-md right-0 choice-list p-3`}
                        onMouseLeave={()=>setShowLanguageOptions(false)}
                    >{languages.length>0 && 
                        languages.map((item:any)=>(
                            <div 
                                key={item.id} className={`choice-list-item`} 
                                onClick={()=>handleChangeLanguage(item.code)}>{t(item.label)}
                            </div>
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

