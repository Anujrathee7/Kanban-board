import { Navigate } from "react-router";
import { useAuth } from "./authContext";
import { Children, ReactNode } from "react";

interface PrivateRouteProps{
    children: ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({children}) =>{
    const {token,loading} = useAuth()
    if(loading){
        return <div>Loading....</div>
    }
    return token ? children : <Navigate to="/" replace/>
}

export default PrivateRoute