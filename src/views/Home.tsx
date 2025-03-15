import Svg from '../components/Svg';
import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import {config} from "../config.ts"
import * as styleFunctions from '../functions/styleFunctions.ts'
import { useSelector } from 'react-redux';

const Home = () => {

  const theme = useSelector((state:any)=>state.main.theme)

  const navigateTo = useNavigate()

  const modules = config.modules

  const [refresh, setRefresh] = useState(1)

  const handleCardClick = (module:string)=>{
    navigateTo(`/${module}`)
  }

  useEffect(()=>{
    setRefresh(-1*refresh)
  },[theme])


  return (
    <div className="flex w-full h-[100%]">

      {modules && modules.map((item)=>(
        <div 
          key={item.id}
          className="card-vertical flex-col m-5"
          onClick = {()=>handleCardClick(item.name)}
          >
          <div className="flex w-full h-[100px]">
            {refresh !=0 && <Svg
              iconName={item.icon_name}
              fillColor = {styleFunctions.getColor("icon")}
            />}
          </div>
          <label className="card-title">{item.title}</label>
          <label className="card-subtitle">{item.subtitle}</label>
          <p className="card-text">
              {item.description}
          </p>
        </div>
      ))}
    
    </div>
  )
}

export default Home
