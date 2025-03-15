import {useState, useEffect} from 'react'

const TopMenu = (props:any) => {

  const [menuItems, setMenuItems] = useState<any>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const getMenuItems = async ()=>{
    setMenuItems(props.menuItems)
  }

  useEffect(()=>{
    getMenuItems()
  },[])

  const handleSelectedItem = (item:any)=>{
    setSelectedItem(item)
    props.handleSelectedItem(item)
  }

  return (
    <div className="top-menu mt-5">
      
      {menuItems.map((item:any)=>(
          <div 
            key={item.id}
            className={selectedItem && selectedItem.id == item.id ? "top-menu-item-selected": "top-menu-item"}
            onClick={()=>handleSelectedItem(item)}
          >
            {item.label}
          </div>
        ))
      }
    </div>
  )
}

export default TopMenu
