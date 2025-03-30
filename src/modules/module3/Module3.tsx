import {useEffect} from 'react'
import { Routes, Route, useNavigate } from "react-router-dom";
import TopMenu from "../../components/TopMenu.tsx";
import View1 from "./View1.tsx";
import View2 from "./View2.tsx";
import View3 from "./View3.tsx";
import View4 from "./View4.tsx";
import View5 from "./View5.tsx";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentView } from "../../redux/slices/mainSlice.ts";

const Module3 = () => {
  const navigateTo = useNavigate();

  const currentModule = useSelector((state:any)=>state.main.currentModule)

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
    navigateTo(`/${currentModule.link}/${selectedView.link}`); // ✅ Use absolute path
  };

  useEffect(()=>{
    handleSelectView(views[0])
  },[])

  return (
    <div className="page flex-col fade-in">
      <h2>{currentModule.label}</h2>
      <TopMenu menuItems={views} handleSelectedItem={handleSelectView} />

      <Routes>
        <Route path="/" element={<View1 />} /> {/* Default View */}
        <Route path="view_1" element={<View1 />} />
        <Route path="view_2" element={<View2 />} />
        <Route path="view_3" element={<View3 />} />
        <Route path="view_4" element={<View4 />} />
        <Route path="view_5" element={<View5 />} />
      </Routes>
    </div>
  );
};

export default Module3;
