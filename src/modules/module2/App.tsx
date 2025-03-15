import TopMenu from '../../components/TopMenu.tsx'
import {useEffect} from 'react'
import View1 from "./View1.tsx"
import View2 from "./View2.tsx"
import View3 from "./View3.tsx"
import View4 from "./View4.tsx"
import View5 from "./View5.tsx"
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentView } from '../../redux/slices/mainSlice.ts'

const App = () => {

  const currentModule = useSelector((state:any)=>state.main.currentModule)
  const currentView = useSelector((state:any)=>state.main.currentView)

  const views:any = [
    {id:1, name: "view_1", label: "View 1", component: <View1 />},
    {id:2, name: "view_2", label: "View 2", component: <View2 />},
    {id:3, name: "view_3", label: "View 3", component: <View3 />},
    {id:4, name: "view_4", label: "View 4", component: <View4 />},
    {id:5, name: "view_5", label: "View 5", component: <View5 />}
  ]

const dispatch = useDispatch()
useEffect(()=>{
  console.log(views)
  dispatch(setCurrentView(views[0]))
},[])

const handleSelectView = (selectedView:any)=>{
  dispatch(setCurrentView(selectedView))
}

  
  return (
    <div className="page flex-col fade-in">
      {currentModule && <label className="title">{currentModule.label}</label>}
      {views.length>0 && <TopMenu menuItems={views} handleSelectedItem={handleSelectView}/>}

      {currentView && <div className="flex w-full h-[100vh] overflow-hidden">
        {
          views.length>0 && views.find((item:any)=>item.id === currentView.id).component
        }
      </div>
      }
    </div>
  )
}

export default App