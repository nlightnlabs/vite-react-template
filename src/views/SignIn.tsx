import {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import {useDispatch} from 'react-redux'
import {setCurrentUser, setUserAuthenticated} from '../redux/slices/mainSlice'
import { useSelector } from 'react-redux';
import * as mainApi from '../apis/pythonServerApi'

const SignIn = () => {

  const appName = useSelector((state:any)=>state.main.appName)

  const navigateTo = useNavigate()
  const dispatch = useDispatch()

  const [errorMessage, setErrorMessage] = useState<any>(null)
  const [formData, setFormData] = useState({
    "username": "",
    "pwd": ""
  })

  const authenticateUser = async ()=>{

    const response = await mainApi.authenticateUser(formData)
    console.log(response)
    if(response.validation){
      dispatch(setUserAuthenticated(true))
      dispatch(setCurrentUser(response.user_info))
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


  return (
    <div className="page flex-col fade-in items-center">

      <h1>{appName}</h1>

      <h3 className="m-auto mt-5 mb-5">Sign In</h3>
 
      <div className="form w-[500px]">
      
        <div className="flex flex-col w-full mb-3">
          <label>Username:</label>
          <input name="username" type="text" autoComplete="off" value={formData.username} onChange={(e)=>handleInputChange(e)} ></input>
        </div>

        <div className="flex flex-col w-full mb-3">
          <label>Password:</label>
          <input name="pwd" type="password" autoComplete="off" value={formData.pwd} onChange={(e)=>handleInputChange(e)}></input>
        </div>

        <button className="primary-button m-auto" onClick={()=>authenticateUser()}>Submit</button>

        {errorMessage && <div className="flex text-red-500 mt-5">{errorMessage}</div>}

      </div>
    </div>
  )
}

export default SignIn

