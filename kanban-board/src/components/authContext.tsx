import React,{createContext, useContext, useEffect, useState, type ReactNode} from "react";
import api from "../api/apiService";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

interface AuthProviderProps{
    children: ReactNode
}

//Context for login/logout

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const TOKEN_KEY = 'token'
    const savedToken = localStorage.getItem(TOKEN_KEY);
    // Setting token to the token saved in the local storage
    const [token, setToken] = useState<string | null>(savedToken? savedToken: null);
    const [loading, setLoading] = useState<boolean>(true);

    
    useEffect(()=>{
        initializeAuth();
    },[])

    const initializeAuth = async () => {
    try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        
        if (savedToken) {
            // Verify token is still valid by fetching profile
            try {
            const response = await api.getProfile(savedToken);
            setToken(savedToken);
            } catch (error) {
            // Token is invalid, clear storage
            clearAuthData();
            }
        }
        } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
        } finally {
        setLoading(false);
        }
    };

    // Function to save token in local storage
    const saveAuthData = (token: string) => {
        localStorage.setItem(TOKEN_KEY, token);
        setToken(token);
    };

    // Function to clear token from local storage
    const clearAuthData = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
    };

    // Login logic
    const login = async(email: string, password: string): Promise<boolean> =>{
        try{
            setLoading(true)
            const response = await api.login(email,password);
            saveAuthData(response.token)
            return true
        }catch(error){
            console.error("Login error",error)
            return false;
        }finally{
            setLoading(false)
        }
    }

    //Register logic
    const register = async(name: string, email: string, password: string):Promise<boolean>=>{
        try{
            setLoading(true)
            const response = await api.register(name,email,password)
            return true
        }catch(error){
            console.error("Registration error",error);
            return false
        }finally{
            setLoading(false)
        }
    }

    const logout = ()=>{
        clearAuthData()
    }

    return(
        <AuthContext.Provider value={{token,login,register,logout,loading}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=>{
    const context = useContext(AuthContext)
    if(!context){
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}