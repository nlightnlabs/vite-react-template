import {useState, useEffect} from 'react'
import { useTranslation } from 'react-i18next'
import "../i18n.ts"


const TopMenu = (props:any) => {

  const { t } = useTranslation("modules")

  const module = props.module

  const [menuItems, setMenuItems] = useState<any>([])
  const [selectedItem, setSelectedItem] = useState<any>(props.currentItem)

  const getMenuItems = async ()=>{
    setMenuItems(props.menuItems)
  }

  const handleSelectedItem = (item:any)=>{
    setSelectedItem(item)
    props.handleSelectedItem(item)
  }

  useEffect(()=>{
    getMenuItems()
  },[props])


  return (
    <div className="top-menu mt-5">
      
      {menuItems.map((item:any)=>(
          <div 
            key={item.id}
            className={selectedItem && selectedItem.id == item.id ? "top-menu-item-selected": "top-menu-item"}
            onClick={()=>handleSelectedItem(item)}
          >
            {t(`${module.name}.views.${item.name}`)}
          </div>
        ))
      }
    </div>
  )
}

export default TopMenu
