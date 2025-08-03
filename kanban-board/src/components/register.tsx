import { useState } from "react";
import {useAuth } from "./authContext";
import { useNavigate } from "react-router-dom";
import { Link} from "react-router";


const Register: React.FC = () => {

    const navigate = useNavigate()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [name,setName]= useState<string>('')
    const [error,setError] = useState<string>('')
    const [loading,setLoading]= useState<boolean>(false)
    const {register} = useAuth();

    const handleSubmit = async (e:React.FormEvent)=>{
        e.preventDefault()
        setError('')    
        if(!name){
            setError("Please enter your name")
            return
        }
        if(!email){
            setError("Please enter your email")
            return
        }
        if(password.length <6){
            setError("Please enter a valid password")
            return
        }
        setLoading(true)
        const success = await register(name,email,password)

        if(!success){
            setError("Cannot register. Try Again")
            setLoading(false)
            return
        }

        setLoading(false)
        navigate('/')
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
            <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-700 mb-2">
                Welcome
            </h1>
            <p className="text-gray-600">Sign up to your kanban board</p>
            </div>
        
        {/* Register Form */}
            <form className="space-y-6" onSubmit={(e)=>{handleSubmit(e)}}>
        
            <div>
            
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                </label>
            
                <input
                type="text"
                value={name}
                onChange={(e)=>setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200 ease-in-out"
            placeholder="Enter your name"
            />
         
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200 ease-in-out"
              placeholder="Enter your email"
            />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
            </label>
            
            <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200 ease-in-out"
            placeholder="Enter your password"
            />
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        )}
        
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white font-bold text-1xl py-3 px-4 rounded-lg hover:bg-indigo-500 focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled= {loading}
          >
            {loading ? "Signing up..." : "Sign up"}
        </button>
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-gray-700">
                Already have an account?{' '}
            <Link to='/'>
            <button
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
            </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register
