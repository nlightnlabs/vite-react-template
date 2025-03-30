import HeaderNavigation from './HeaderNavigation'
import { useNavigate } from 'react-router-dom';
import {useSelector} from 'react-redux'

import {setCurrentUser, setUserAuthenticated, resetState} from '../redux/slices/mainSlice.js'
import { store, persistor } from '../redux/Store.tsx'

const Header = () => {

  const navigateTo = useNavigate()
  // const dispatch = useDispatch()

  const appName:string = useSelector((state:any)=>state.main.appName)
  const user:any = useSelector((state:any)=>state.main.currentUser)
 

  const handleSignOut = ()=>{
    persistor.purge().then(() => {
      store.dispatch(setCurrentUser(false)); 
      store.dispatch(setUserAuthenticated(false));
      store.dispatch(resetState()); 
    });
    navigateTo("/")
  }

  return (
    <div className="header">

      <h3>{appName}</h3>
      
      <div className="flex w-[50%] justify-end me-5">
      
      <HeaderNavigation/>
      
      {user &&
        <div className="flex flex-col items-center w-[75px]">
          <div className={`flex font-bold`}>{user.first_name}</div>
          <div className="flex text-[12px] cursor-pointer hover:text-yellow-400" onClick={()=>handleSignOut()}>Sign Out</div>
        </div>
      }

      {!user &&<button className="button-primary m-3" onClick={()=>handleSignOut()}>Reset</button>}

      </div>
    </div>
  )
}

export default Header

