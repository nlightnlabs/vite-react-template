import '../i18n';
import { useTranslation } from 'react-i18next';

import Svg from '../components/Svg';
import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import {config} from "../config.ts"
import * as styleFunctions from '../functions/styleFunctions.ts'
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentModule } from '../redux/slices/mainSlice.ts';

const modules = config.modules

const Home = () => {

  const { t } = useTranslation("modules");
  
  const theme = useSelector((state:any)=>state.main.theme)

  const navigateTo = useNavigate()
  const dispatch = useDispatch()
  const [refresh, setRefresh] = useState(1)

  const handleCardClick = (module:any)=>{
    dispatch(setCurrentModule(module))
    navigateTo(`/${module.link}`)
  }

  useEffect(()=>{
    setRefresh(-1*refresh)
  },[theme])


  return (
    <div 
      className="flex w-full h-[100%] flex-wrap"
      style={{transition: "all 0.5s ease-in-out"}}
    >

      {modules && modules.map((item:any)=>(
        <div 
          key={item.id}
          className="card-vertical flex-col m-5"
          onClick = {()=>handleCardClick(item)}
          >
          <div className="flex w-full h-[100px]">
            {refresh !=0 && 
            <Svg
              iconName={item.icon_name}
              fillColor = {styleFunctions.getColor("icon")}
            />}
          </div>
          <label className="card-title">{t(item.title)}</label>
          <label className="card-subtitle">{t(item.subtitle)}</label>
          <p className="card-text">
              {t(item.description)}
          </p>
        </div>
      ))}
    
    </div>
  )
}

export default Home
