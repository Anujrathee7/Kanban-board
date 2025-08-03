import { useState,useEffect } from "react";
import { useAuth } from "./authContext";
import api from "../api/apiService";
import { Board } from "../model/Type";
import { FiLogOut,FiX } from "react-icons/fi";   
import { Link } from "react-router-dom";
import UserColumn from "./column";
import { FaPlusCircle } from "react-icons/fa";

const UserBoard: React.FC = ()=>{
    const {token,logout} = useAuth();
    const [board,setBoard] = useState<Board| null>(null);
    const [error,setError] = useState<string>('');
    const [loading,setLoading] = useState<boolean>(true);
    const [user,setUser] = useState<string>('')
    
    const [showModal, setShowModal] = useState<boolean>(false)
    const [inputValue, setInputValue] = useState<string>('');

    //State to handle card drag and drop functionality
    const [draggedCard, setDraggedCard] = useState<string | null>(null)

    //State to handle card sorting
    const [sortOption, setSortOption] = useState<string>("none")
    const [searchTerm, setSearchTerm] = useState<string>("")

    // State to handle board title change

    const [editingBoard, setEdititngBoard] = useState<boolean>(false)
    const [editedBoardTitle, setEditedBoardTitle] = useState<string | undefined>("")
    
    //Function to get board
    const getBoard = async()=>{
        try{

            const response = await api.getBoard(token)
            const userResponse = await api.getProfile(token)

            setUser(userResponse.user.name)
            setBoard(response.board)
            console.log(response.board)
            setLoading(false)
        }catch(error:any){
            setError(error.message || 'Failed to load board')
            setLoading(true)
            return
        }
    }

    //Function to add column
    const addColumn = async(title: string)=>{
        try{
            const response = await api.createColumn(title,token)
            if(response){
                getBoard()
            }
        }catch(error: any){
            setError(error.message || 'Failed to Add Column')
        }
    }

    //Modal handling
    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
    
    const handleSubmit = () => {
    addColumn(inputValue)
    setShowModal(false);
    setInputValue('');
    };

    const handleBoardTitleUpdate = async ()=>{
        try{
            const response = await api.updateBoard(editedBoardTitle,token)
            if(response){
                getBoard()
                setEdititngBoard(false)
                setEditedBoardTitle("")
            }

        }catch(error){
            console.error("Board title update errro:",error)
        }
    }


    useEffect(()=>{
        getBoard()
    },[])

    return(
        <div>
            {loading && (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your board...</p>
            </div>
            </div>
            )}

            {!loading &&(
            <div className="min-h-screen bg-gray-100 ">

                {/*Header for the home page */}
                <header className="bg-neutral-800 shadow-sm border-b border-white mb-4">
                    <div className="min-w-screen px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            
                            {editingBoard ?
                            
                            <div className="flex items-center justify-between space-x-4">
                                <input
                                className=" w-full p-2 rounded-md bg-white border-2 border-violet-300 text-zinc-900 placeholder-zinc-500 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-violet-400 "
                                value={editedBoardTitle}
                                onChange={(e)=>setEditedBoardTitle(e.target.value)}
                                />
                                <button
                                className="text-sm p-2 font-medium text-white bg-violet-600 border border-transparent rounded-md shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-50 active:bg-violet-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!editedBoardTitle?.trim()}
                                onClick={()=>handleBoardTitleUpdate()}
                                >
                                    Submit
                                </button>
                            </div>
                            : <div className="flex space-x-4"
                            onDoubleClick={()=>{
                                setEdititngBoard(true)
                                setEditedBoardTitle(board?.name)
                            }}
                            >
                                <h1 className="sm:text-2xl font-bold text-white">
                                    {board?.name || "My kanaban board"}
                                </h1>
                            </div>
                            }
                            
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 font-bold text-white">
                                    <span className="hidden sm:inline">Hello, {user}</span>
                                </div>
                                
                        {/*Logout Button */}     
                        <button
                                onClick={logout}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-red-600 transition-colors cursor-pointer"
                                title="logout"
                                >
                                <Link to="/">
                                <FiLogOut className="w-5 h-5"></FiLogOut>
                                </Link>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/*Error Dispaly */}
                {error && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                            <span>{error}</span>
                            <button
                            onClick={()=>setError('')}
                            className="text-red-400 hover:text-red-600 cursor-pointer"
                            >
                            <FiX className="h-6 w-6"/>
                            </button>
                        </div>
                    </div>
                )}

            {/*Sort and Search dropdown and <input type="text" /> */}
            <div className="flex items-center justify-center gap-x-2 mb-3">
             <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-40 rounded bg-neutral-600 text-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
            >
                <option value="none">None</option>
                <option value="updated-newest">Updated: Newest first</option>
                <option value="updated-oldest">Updated: Oldest first</option>
                <option value="title-asc">Title: A-Z</option>
                <option value="title-desc">Title: Z-A</option>
            </select>
  {/* Search input */}
            <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-50 rounded bg-neutral-600 text-white placeholder-neutral-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
            />
            </div>

            {/*Board content*/}
                
            <div className="flex min-h-[80vh] max-w-[200vh] mx-auto gap-3 overflow-x-scroll overflow-y-auto p-10 bg-neutral-800 rounded-lg ">
                {board?.columns.map((column)=>(
                    <UserColumn
                    column={column}
                    getBoard={getBoard}
                    key={column._id}
                    draggedCard={draggedCard}
                    setDraggedCard={setDraggedCard}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    />    
                ))}

            {/*Button to add new column */}
            <div className="bg-neutral-700 flex flex-row items-center justify-center rounded-md min-w-[100px] hover:bg-neutral-600 transition cursor-pointer"
                onClick={()=>{handleOpen()}}
                >
                    <div className="flex flex-col items-center justify-between text-white">
                        <FaPlusCircle className="text-white"></FaPlusCircle>
                        Add
                    </div>
                </div>
            </div>
        
            </div>)}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                    <h2 className="text-lg font-semibold mb-4">Enter your Title</h2>
                    <input
                    type="text"
                    className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type something..."
                    />
                    <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Submit
                    </button>
                    </div>
                </div>
                </div>
            )}
        </div>)}

export default UserBoard