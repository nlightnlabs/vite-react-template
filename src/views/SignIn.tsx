import {useState} from 'react'
import { useTranslation } from 'react-i18next';
import "../i18n";
import { useNavigate } from 'react-router-dom';
import {useDispatch} from 'react-redux'
import {setCurrentUser, setUserAuthenticated} from '../redux/slices/mainSlice'
import { useSelector } from 'react-redux';
import * as mainApi from '../apis/pythonServerApi'


const SignIn = () => {

  const { t } = useTranslation("signin");

  const appName = useSelector((state:any)=>state.main.appName)

  const navigateTo = useNavigate()
  const dispatch = useDispatch()

  const [errorMessage, setErrorMessage] = useState<any>(null)
  const [formData, setFormData] = useState({
    "username": "",
    "pwd": ""
  })

  const authenticateUser = async ()=>{

    const response = await mainApi.authenticateUser(formData.username, formData.pwd)
    if(response.validation){
      console.log(response.user)
      dispatch(setUserAuthenticated(true))
      dispatch(setCurrentUser(response.user))
      navigateTo("/home")
    }else{
      dispatch(setUserAuthenticated(false))
      dispatch(setCurrentUser(null))
      setErrorMessage(response.message)
    }
  }

  const handleInputChange = (e:any)=>{
    const {name, value} = e.target
    setFormData({...formData,...{[name]:value}})
  }

  const handleCreateAccount = ()=>{
    navigateTo("/create_account")
  }

  const handleForgotPassword = ()=>{
    navigateTo("/reset_password")
  }

  return (
    <div className="page flex-col fade-in items-center">

      <span className="flex text-[72px] m-5">{appName}</span>
 
      <div className="form w-[500px]">
      
        <div className="flex flex-col w-full mb-3">
          <label>{t("user_name")}:</label>
          <input name="username" type="text" autoComplete="off" value={formData.username} onChange={(e)=>handleInputChange(e)} ></input>
        </div>

        <div className="flex flex-col w-full mb-3">
        <label>{t("password")}:</label>
          <input name="pwd" type="password" autoComplete="off" value={formData.pwd} onChange={(e)=>handleInputChange(e)}></input>
        </div>

        <button className="primary-button m-auto" onClick={()=>authenticateUser()}>{t("signin")}</button>

        {errorMessage && <div className="flex text-red-500 mt-5">{errorMessage}</div>}

        <div className="flex w-full justify-center">
          <span className="link m-3" onClick={()=>handleForgotPassword()}>{t("forgot_password")}</span>
          <span className="link m-3" onClick={()=>handleCreateAccount()}>{t("create_account")}</span>
        </div>

      </div>
    </div>
  )
}

export default SignIn

