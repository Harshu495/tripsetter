import './App.css';
import { Link, Route, Routes } from "react-router-dom"
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LOGOUT } from './slices/userSlice';
import PrivateRouter from './middleweare/PrivateRouter';
import Home from './components/Home';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import GDashboard from './components/Guid/GDashboard';
import ADashboard from './components/Admin/ADashboard';
import CityAutocomplete from "./components/Search"
import SubscriptionPlan from './components/SubscribePlan';
function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data, isSignedIn } = useSelector((state) => state.user)
  return (
    <div className="App">
      <ul className='top-nav'>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/subscription-plan">Subscription</Link></li>
        <li><Link to="/search">Search</Link></li>
        {!isSignedIn ? <>
          {/* <li><Link to="/register">Register</Link></li> */}
          <li><Link to="/signin">Sign in</Link></li>
        </> : <>
          {data?.role === "Guid" && (
            <li><Link to="/gdashboard">Dashboard</Link></li>
          )}
          {data?.role === "admin" && (
            <li><Link to="/adashboard">Dashboard</Link></li>
          )}
          <li><button onClick={() => {
            localStorage.removeItem("token")
            navigate("/")
            dispatch(LOGOUT())
          }}>Logout</button></li>
        </>}


      </ul>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/search" element={<CityAutocomplete />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/gdashboard' element={
          <PrivateRouter primmitedRole={["Guid"]}>
            <GDashboard />
          </PrivateRouter>} />
        <Route path='/adashboard' element={
          <PrivateRouter primmitedRole={["admin"]}>
            <ADashboard />
          </PrivateRouter>} />
        <Route path='/subscription-plan' element={<SubscriptionPlan />} />
      </Routes>
    </div >
  );
}

export default App;
