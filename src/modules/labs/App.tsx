import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TopMenu from "../../components/TopMenu.tsx";
import DocAnimation from "./DocAnimation.tsx";
import SendEmail from "./SendEmail.tsx";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentView } from "../../redux/slices/mainSlice.ts";
import RecordManager from "./RecordManager.tsx"

const Labs = () => {
  const navigateTo = useNavigate();

  const currentModule = useSelector((state:any)=>state.main.currentModule)
  const currentVeiw = useSelector((state:any)=>state.main.currentView)

  const views = [
    { id: 1, name: "send_email", label: "Send Email", link: "send_email", icon: "", component: <SendEmail /> },
    { id: 2, name: "record_manager", label: "Record Manager", link: "record_manager", icon: "", component: <RecordManager /> },
    { id: 3, name: "doc_animation", label: "Doc Animation", link: "doc_animation", icon: "", component: <DocAnimation /> }
  ];

  const dispatch = useDispatch()
  const handleSelectView = (selectedView: any) => {
    delete selectedView.component
    dispatch(setCurrentView(selectedView))
    navigateTo(`/${currentModule.link}/${selectedView.link}`); // ✅ Use absolute path
  };

  useEffect(()=>{
    const initialView = currentVeiw !=null ? currentVeiw : views[2]
    console.log(initialView)
    handleSelectView(initialView)
  },[])

  return (
    <div className="page flex-col fade-in">
      <h2>{currentModule.label}</h2>
      <TopMenu menuItems={views} handleSelectedItem={handleSelectView} />

      <Routes>
        <Route path="/" element={<SendEmail />} /> {/* Default View */}
        <Route path="send_email" element={<SendEmail />} />
        <Route path="record_manager" element={<RecordManager />} />
        <Route path="doc_animation" element={<DocAnimation />} />
      </Routes>
    </div>
  );
};

export default Labs;
