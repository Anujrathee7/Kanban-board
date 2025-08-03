import Login from "./components/login"
import { BrowserRouter,Routes,Route } from "react-router-dom"
import Register from "./components/register"
import UserBoard from "./components/board"
import PrivateRoute from "./components/privateRoute"

const App = ()=>{
  return(
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/register"element={<Register/>}/>
      <Route path="/home" element={<PrivateRoute><UserBoard/></PrivateRoute>}/> 
    </Routes>
    </BrowserRouter>
  )
}

export default App
