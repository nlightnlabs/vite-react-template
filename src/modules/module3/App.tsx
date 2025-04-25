import {useEffect} from 'react'
import { useTranslation } from "react-i18next";
import "../../i18n.ts"
import { Routes, Route, useNavigate } from "react-router-dom";
import TopMenu from "../../components/TopMenu.tsx";
import View1 from "./View1.tsx";
import View2 from "./View2.tsx";
import View3 from "./View3.tsx";
import View4 from "./View4.tsx";
import View5 from "./View5.tsx";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentView, setCurrentPath } from "../../redux/slices/mainSlice.ts";

const App = () => {

  const { t } = useTranslation("modules");
  const navigateTo = useNavigate();

  const currentModule = useSelector((state:any)=>state.main.currentModule)
  const currentVeiw = useSelector((state:any)=>state.main.currentView)

  const views = [
    { id: 1, name: "view_1", label: "View 1", link: "view_1", icon: "", component: <View1 /> },
    { id: 2, name: "view_2", label: "View 2", link: "view_2", icon: "", component: <View2 /> },
    { id: 3, name: "view_3", label: "View 3", link: "view_3", icon: "", component: <View3 /> },
    { id: 4, name: "view_4", label: "View 4", link: "view_4", icon: "", component: <View4 /> },
    { id: 5, name: "view_5", label: "View 5", link: "view_5", icon: "", component: <View5 /> }
  ];

  const dispatch = useDispatch()
  const handleSelectView = (selectedView: any) => {
    delete selectedView.component
    dispatch(setCurrentView(selectedView))
    const path = `/${currentModule.link}/${selectedView.link}`
    dispatch(setCurrentPath(path))
    navigateTo(path); 
  };

  useEffect(()=>{
    const initialView = currentVeiw !=null ? currentVeiw : views[0]
    handleSelectView(initialView)
  },[])

  return (
    <div className="page flex-col fade-in">
    
      <h2>{t(currentModule.title)}</h2>
      <TopMenu 
        module={currentModule} 
        currentItem={currentVeiw} 
        menuItems={views} 
        handleSelectedItem={handleSelectView} 
      />

      <Routes>
        {/* <Route path="/" element={<View1 />} /> */}
        <Route path="view_1" element={<View1 />} />
        <Route path="view_2" element={<View2 />} />
        <Route path="view_3" element={<View3 />} />
        <Route path="view_4" element={<View4 />} />
        <Route path="view_5" element={<View5 />} />
      </Routes>
    </div>
  );
};

export default App;