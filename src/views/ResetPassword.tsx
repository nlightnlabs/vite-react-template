import {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import {useDispatch} from 'react-redux'
import {setCurrentUser, setUserAuthenticated} from '../redux/slices/mainSlice'
import { useSelector } from 'react-redux';
import * as mainApi from '../apis/pythonServerApi'
import {config} from '../config.ts'

const ResetPassword = () => {

  const appName = useSelector((state:any)=>state.main.appName)

  const navigateTo = useNavigate()
  const dispatch = useDispatch()

  const [errorMessage, setErrorMessage] = useState<any>(null)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<any>(null)
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<any>(null)
  const [formData, setFormData] = useState({
    "email": "",
    "username": "",
    "password": "",
    "confirm_password": ""
  })
  const [showPasswordResetForm,setShowPasswordResetForm] = useState<boolean>(false)

  const verifyAccount = async ()=>{

    const query = `SELECT username from users where email='${formData.email}'`
    const response = await mainApi.getData(query)
    

    if(response[0] && response[0].username && response[0].username.length>0){ 
      setFormData({...formData,...{"username":response[0].username}})
      setErrorMessage(null)
      setShowPasswordResetForm(true)
    }else{
      setErrorMessage("Account not found.  Please try entering another email or create a new account.")
    }
  }

  const handleInputChange = (e:any)=>{
    setErrorMessage(null)
    setPasswordErrorMessage(null)
    setShowPasswordResetForm(false)
    const {name, value} = e.target
    setFormData({...formData,...{[name]:value}})
  }

  const updatePassword = async ()=>{
    if(formData.password === formData.confirm_password){
      await mainApi.resetPassword(formData.username, formData.password)
      setPasswordSuccessMessage("Password successfully reset. Going back to sign in...")
      setTimeout(()=>{
        navigateTo("/signin")
      },3000)
    }else{
      setPasswordErrorMessage("Passwords do not match.")
    }
  }



  return (
    <div className="page flex-col fade-in items-center">

      <span className="flex text-[72px] m-5">{appName}</span>
 
      <div className="form w-[500px]">
      
        <div className="flex flex-col w-full mb-3">
          <label>Email:</label>
          <input 
            name="email" 
            type="email" 
            autoComplete="off" 
            placeholder="Enter your email"
            value={formData.email} onChange={(e)=>handleInputChange(e)} 
            >
          </input>
        </div>

        <div className="flex w-full justify-end">
          <button className="primary-button mr-1" onClick={()=>verifyAccount()}>Submit</button>
        </div>

        {errorMessage && 
          <div className="flex flex-col text-red-500 mt-5 p-3">
            {errorMessage}
            <div className="flex w-full justify-center">
              <span className="link m-3" onClick={()=>navigateTo("/create_account")}>Create Account</span>
            </div>
          </div>
        }

      

      </div>

      {showPasswordResetForm && 
       <div className="form w-[500px] p-3 mt-5 float-up">
       <h4>Create new password</h4>

       {formData.username.length>0 && 
        <label 
        className="flex w-full mt-3 mb-3">Your Username: <span className="font-bold text-[var(--emphasis-color)] ms-3">{formData.username}</span>
        </label>
      }
         
         <div className="flex flex-col w-full mb-3">
           <label>New Password:</label>
           <input 
            name="password" 
            type="password" 
            autoComplete="off" 
            placeholder="Enter new password"
            value={formData.password} 
            onChange={(e)=>setFormData({...formData,...{"password":e.target.value}})}
            ></input>
         </div>

         <div className="flex flex-col w-full mb-3">
           <label>Confirm New Password:</label>
           <input 
            name="confirm_password" 
            type="password" 
            autoComplete="off" 
            placeholder="Confirm password"
            value={formData.confirm_password} 
            onChange={(e)=>setFormData({...formData,...{"confirm_password":e.target.value}})}
            ></input>
         </div>

         {/* Submit Button */}
         <div className="flex flex-col w-full">
         <div className="flex w-full justify-end">
           <button className="primary-button" onClick={()=>updatePassword()}>Reset</button>
        </div>
           {passwordErrorMessage && <div className="flex text-red-500 mt-5 p-3">{passwordErrorMessage}</div>}
           {passwordSuccessMessage && <div className="flex text-green-600 mt-5 p-3">{passwordSuccessMessage}</div>}
         </div>

     </div>
        }
    </div>
  )
}

export default ResetPassword