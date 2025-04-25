import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TopMenu from "../../components/TopMenu.tsx";

import Sandbox from "./Sandbox.tsx";
import DocAnimation from "./DocAnimation.tsx";
import SampleForm from './Form.tsx';
import SendEmail from "./SendEmail.tsx";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentView,setCurrentPath } from "../../redux/slices/mainSlice.ts";
import RecordManager from "./RecordManager.tsx"
import Dashboard from './Dashboard.tsx'
import Echarts from './Echarts.tsx'

const Labs = () => {
  const navigateTo = useNavigate();

  const currentModule = useSelector((state:any)=>state.main.currentModule)
  const currentVeiw = useSelector((state:any)=>state.main.currentView)

  const views = [
    { id: 1, name: "sample_form", label: "Sample Form", link: "sample_form", icon: "", component: <SampleForm /> },
    { id: 2, name: "send_email", label: "Send Email", link: "send_email", icon: "", component: <SendEmail /> },
    { id: 3, name: "record_manager", label: "Record Manager", link: "record_manager", icon: "", component: <RecordManager /> },
    { id: 4, name: "dashboard", label: "Dashboard", link: "dashboard", icon: "", component: <Dashboard /> },
    { id: 5, name: "echarts", label: "Echarts", link: "echarts", icon: "", component: <Echarts /> },
    { id: 6, name: "doc_animation", label: "Doc Animation", link: "doc_animation", icon: "", component: <DocAnimation /> },
    { id: 7, name: "sandbox", label: "Sandbox", link: "sandbox", icon: "", component: <Sandbox /> },
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
    const initialView = currentVeiw !=null ? currentVeiw : views[2]
    handleSelectView(initialView)
  },[])

  return (
    <div className="page flex-col fade-in">
      <h2>{currentModule.label}</h2>
      <TopMenu 
        module={currentModule} 
        currentItem={currentVeiw} 
        menuItems={views} 
        handleSelectedItem={handleSelectView} 
      />

      <Routes>
        <Route path="/" element={<Sandbox />} /> 
        <Route path="/sandbox" element={<Sandbox />} /> 
        <Route path="sample_form" element={<SampleForm />} />
        <Route path="send_email" element={<SendEmail />} />
        <Route path="record_manager" element={<RecordManager />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="echarts" element={<Echarts />} />
        <Route path="doc_animation" element={<DocAnimation />} />
      </Routes>
    </div>
  );
};

export default Labs;
