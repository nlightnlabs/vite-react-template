import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { store, persistor } from './redux/Store.tsx'
import {setCurrentUser, setUserAuthenticated, resetState, setCurrentPath} from './redux/slices/mainSlice.js'

import Header from './components/Header';
import Home from './views/Home';
import Settings from './views/Settings';
import SignIn from './views/SignIn';
import CreateAccount from './views/CreateAccount.tsx';
import ResetPassword from './views/ResetPassword.tsx';

import "./styles/style.css"
import SideMenu from './components/SideMenu';
import Labs from './modules/labs/App.tsx';


import Module1 from './modules/module1/Module1.tsx';
import Module2 from './modules/module2/Module2.tsx';
import Module3 from './modules/module3/Module3.tsx';

import {config} from './config.ts'

const App = () => {
  const userAuthenticated = useSelector((state:any) => state.main.userAuthenticated);

  const theme:string = useSelector((state:any) => state.main.theme);
  const user:any = useSelector((state:any) => state.main.currentUser);
  const appName:string = useSelector((state:any) => state.main.appName);
  const themes:any = config.themes

  const changeTheme = (selectedTheme:string) =>{
    document.documentElement.classList.add(selectedTheme);
    themes.forEach((item:any)=>{
      if(item.name!=selectedTheme)
        document.documentElement.classList.remove(item.name);
    })
  }

  const handleSignOut = ()=>{
    persistor.purge().then(() => {
      store.dispatch(setCurrentUser(false)); 
      store.dispatch(setUserAuthenticated(false));
      store.dispatch(resetState()); 
    });
  }

  // useEffect(()=>{
  //   console.log("User Authenticated",userAuthenticated)
  //   console.log("Current User:",user)
  // },[])

  useEffect(()=>{
    changeTheme(theme)
  },[theme])

  const ProtectedRoute = ({children}:any) => {
    if (!userAuthenticated) {
      return <Navigate to="/signin" replace />;
    }
    return children;
  };


  const [refresh, setRefresh] = useState(1)
  useEffect(()=>{
    setRefresh(-1*refresh)
  },[theme, user, appName])


  return (
    <Router>
      {userAuthenticated && refresh!=0  && <Header/>}
      
      {refresh!=0  && <div className="main-container">
        {userAuthenticated &&<SideMenu/>}
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/create_account" element={<CreateAccount />} />
            <Route path="/reset_password" element={<ResetPassword />} />
            <Route path="/labs/*" element={<Labs />} />
            <Route path="/module_1/*" element={<Module1 />} />
            <Route path="/module_2/*" element={<Module2 />} />
            <Route path="/module_3/*" element={<Module3 />} />
          </Routes>
        </div>}
    </Router>
  );
};

export default App;


