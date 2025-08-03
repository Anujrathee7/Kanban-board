import { useState } from "react";
import { useAuth } from "./authContext";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error,setError] = useState<string>('')
  const [loading,setLoading]= useState<boolean>(false)
  const {login} = useAuth();

  const handleSubmit = async(e: React.FormEvent)=>{
    e.preventDefault()
    setError('')

    if(!email){
        setError("Email cannot be Empty")
        return
    }

    setLoading(true)
    const success = await login(email,password);
    if(!success){
        setError("Invalid email or password")
        setLoading(false)
        return
    }
    setLoading(false)
    navigate('/home')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your kanban board</p>
        </div>
        
        {/*Login Form */}
        <form className="space-y-6" onSubmit={(e)=>handleSubmit(e)}>
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 text-center">
            <p className="text-gray-700">
                Don't have an account?{' '}
            <Link to='/register'>
            <button
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </button>
            </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
