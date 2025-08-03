import React, { useEffect, useState } from "react";
import { Column,Card } from "../model/Type";
import { FaTrash,FaX,FaPlus  } from "react-icons/fa6";
import api from "../api/apiService";
import { useAuth } from "./authContext";
import {  motion, } from "framer-motion";
import { FiPlus } from "react-icons/fi";


interface ColumnProps{
    column: Column,
    getBoard: ()=>void, //Function to update the kanban board
    draggedCard: string | null,
    setDraggedCard: React.Dispatch<React.SetStateAction<string | null>>
    sortOption: string,
    setSortOption: React.Dispatch<React.SetStateAction<string>>
    searchTerm: string,
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>
}


const UserColumn: React.FC<ColumnProps> = ({column,getBoard,draggedCard,setDraggedCard,sortOption,setSortOption,searchTerm,setSearchTerm})=>{
    const {_id, title,position,cards} = column
    const {token} = useAuth()
    const [isAdding,setIsAdding] = useState<boolean>(false)
    const [cardTitle,setCardTitle] = useState<string>('')
    const [cardDescription, setCardDescription] = useState<string>('')

    // Use state to make header and title editable
    const [editingCard, setEdititngCard] = useState<string | null>(null)
    const [editedCardTitle, setEditedCardTitle] = useState<string>('')
    const [editedCardDescription, setEditedCardDescription] = useState<string | undefined>('')

    // Drag and drop states
    const [dragOverColumn, setDragOverColumn] = useState<boolean>(false)
    const [dragOverPosition, setDragOverPosition] = useState<number | null>(null)


    //Delete colummn funciton
    const handleDeleteColumn = async(column_id: string)=>{
        try{
            const response = await api.deleteColumn(column_id,token)
            if(response){
                getBoard();
            }           
        }catch(error: any){
            console.error("Error deleting column")
        }
    }

    //Add card function
    const handleAddCard = async()=>{
        try{
            const response = await api.createCard(cardTitle,_id,token,cardDescription)
            if(response){
                getBoard()
                setCardTitle('')
                setCardDescription('')
                setIsAdding(false)
            }
        }catch(error){
            console.error(error)
        }
    }

    //Delete card function 
    const handleDeleteCard = async(card_id: string)=>{
        try{
            const response = await api.deleteCard(card_id,token)
            if(response){
                getBoard()
            }
        }catch(error){
            console.error("Cannot delete card")
        }
    }

    // Card editing/updating functions
    const startEditing = (card : Card):void =>{
        setEdititngCard(card._id)
        setEditedCardTitle(card.title)
        setEditedCardDescription(card.description)
    }

    const handleCardEdititng = async ()=>{
        try{
            if(editingCard){
            const response = await api.updateCard(editingCard,editedCardTitle,token,editedCardDescription)
            if(response){
                setEdititngCard(null)
                setEditedCardTitle('')
                setEditedCardDescription('')
                getBoard()
            }
            }
        }catch(error){
            console.error(error)
        }
    }

    //Time Stamp formatting sample
    const formatTimeStamp = (timeStamp: string)=>{
        const date = new Date(timeStamp)
        return date.toLocaleString(undefined,{
            dateStyle: 'medium',
        })
    }

    const updateTime = (timeStamp: string)=>{
        const now = new Date
        const date = new Date(timeStamp)
        const diff = (now.getTime() - date.getTime()) / 1000;

        if (diff < 60) return `${Math.floor(diff)}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    //Drag and Drop function

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, cardId: string) =>{
        setDraggedCard(cardId)
        e.dataTransfer.setData("cardId",cardId)
        e.dataTransfer.effectAllowed = "move"

        setTimeout(()=>{
            (e.target as HTMLElement).style.opacity = "0.5"
        },0)
    }

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setDraggedCard(null)
        setDragOverColumn(false)
        setDragOverPosition(null);
        
        // Reset visual feedback
        (e.target as HTMLElement).style.opacity = "1";
    }

    const handleDragOver = (e:React.DragEvent<HTMLDivElement>) =>{
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setDragOverColumn(true)
    }

    const handleDragLeave = (e:React.DragEvent<HTMLDivElement>)=>{
        if(!e.currentTarget.contains(e.relatedTarget as Node)){
            setDragOverColumn(false)
            setDragOverPosition(null)
        }
    }

    const handleCardDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault()
        e.stopPropagation()
        
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const mouseY = e.clientY;
        
        // Determine if we should insert before or after this card
        const insertPosition = mouseY < midY ? index : index + 1;
        setDragOverPosition(insertPosition);
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) =>{
        e.preventDefault()

            const cardId = e.dataTransfer.getData("cardId")
            if (!cardId) return

            let targetPosition = dragOverPosition !== null ? dragOverPosition : cards.length;

            // Find the current position of the dragged card
            const currentCard = cards.find(card => card._id === cardId);
            const currentPosition = currentCard ? currentCard.position : -1;

            // If dropping in the same position, do nothing
            if (currentPosition === targetPosition) {
                setDragOverColumn(false)
                setDragOverPosition(null)
                setDraggedCard(null)
                return;
            }

        try{
            const response = await api.moveCard(cardId,_id,targetPosition,token)
            if(response){
                getBoard()
            }
        }catch(error){
            console.error("Error moving card",error)
        }

        setDragOverColumn(false)
        setDragOverPosition(null)
        setDraggedCard(null)
    }

    // Card sorting and search function

    const filteredCards = cards.filter(card=>
        (card.description && (
            card.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
            card.title.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    )

    const sortedCards = [...filteredCards].sort((a, b) => {
        switch (sortOption) {
            case "title-asc":
                return a.title.localeCompare(b.title);
            case "title-desc":
                return b.title.localeCompare(a.title);
            case "updated-newest":
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            case "updated-oldest":
                return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            default:
                return 1;
        }
    }
);

    return(
        <div className={`bg-neutral-700 border border-neutral-600 shadow-md rounded-lg p-3 min-w-70 md:min-w-90 ${
            dragOverColumn && draggedCard
            ? 'border-violet-400 bg-neutral-600 shadow-lg shadow-violet-300/20' 
            : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        >
            
            {/*Heading for column */}
            <div className="mb-3 flex items-center justify-between">
                <h3 className={`font-bold text-white`}>{title}{' - '}
                <span className="rounded font-medium text-sm text-neutral-100">
                    {cards.length}
                </span>
                </h3>

                {/* Delete Column Button*/}
                <button onClick={()=>{
                    handleDeleteColumn(_id)
                }} 
                    className="cursor-pointer"
                    >
                    <FaTrash className="text-neutral-100 hover:text-red-400 hover:animate-bounce"></FaTrash>
                </button>
            </div>

            {/*Drop zone indicator at the top */}
            {dragOverPosition === 0 && draggedCard && (
                <div className="h-2 bg-violet-400 rounded-full mb-2 opacity-80"></div>
            )}

            {/*Mapping card for the column*/}
            {sortedCards.map((card,index)=>(

                <div
                draggable = {editingCard !== card._id}
                onDragStart={(e)=> handleDragStart(e,card._id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleCardDragOver(e, index)}
                key={card._id}
                onDoubleClick={()=> startEditing(card)}
                className={`${draggedCard === card._id ? 'opacity-50' : ''}`}
                >

                    {/*Card Title*/}
                    <motion.div
                    className={`
                        ${editingCard === card._id 
                        ? 'border-none bg-zinc-50 text-zinc-900'
                        : 'cursor-grab rounded-lg border transition-all duration-300 border-neutral-600 bg-neutral-800 hover:border-neutral-400'}
                        p-2 active:cursor-grabbing mb-4 `}
                    >

                            {editingCard === card._id ? (
                            <>
                            <div className="flex flex-col">
                                {/*Input field to edit card title */}
                                <input
                                type="text"
                                value={editedCardTitle}
                                onChange={(e) => setEditedCardTitle(e.target.value)}
                                className=" w-full rounded-md bg-white border-2 border-violet-300 text-zinc-900 placeholder-zinc-500 px-3 py-2 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm mt-2 mb-4 hover:border-violet-400 "
                                placeholder="Edit title..."
                                autoFocus
                                />
                                <textarea
                                className=" w-full rounded-md bg-white border-2 border-violet-300 text-zinc-900 placeholder-zinc-500 px-3 py-2 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm mb-2 hover:border-violet-400 "
                                value={editedCardDescription}
                                onChange={(e)=>{setEditedCardDescription(e.target.value)}}
                                />

                                {/*Submit and cancel button for card editing */}
                                <div className="flex gap-x-2">
                                    
                                    <button
                                    type="submit"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-50 active:bg-violet-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={()=>handleCardEdititng()}
                                    disabled={!editedCardTitle.trim()}

                                    >
                                        Submit
                                    </button>

                                    <button
                                    className=" inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md border border-transparent shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-red-300 transition-all duration-200 "
                                    onClick={()=>{setEdititngCard(null)}}
                                    >
                                        Cancel
                                    </button>

                                </div>
                            </div>
                            </>
                            ): (
                            <>

                            {/* Card title and delete button */}
                            <div className="flex items-center justify-between mb-3 pt-1">
                                <h3 className="text-white font-medium ml-2">{card.title}</h3>
                                
                                <button onClick={()=>{handleDeleteCard(card._id)}}
                                    className="cursor-pointer px-2"
                                    >
                                    <FaX className="text-white w-4 h-3 hover:text-red-500"></FaX>
                                </button>
                            </div>

                            {/*Card description */}

                            <div className=" bg-neutral-700 mb-4 p-3 rounded-lg">
                                <p className="text-white text-sm ml-2">
                                    {card.description}
                                </p>
                            </div>

                                {/*Time stamp for cards */}
                            <div className="flex justify-between items-center text-neutral-400 text-xs mt-2 ml-2 mr-2">
                                <span className="hidden md:block"> {formatTimeStamp(card.createdAt)}</span>
                                <span>Updated {updateTime(card.updatedAt)}</span>

                            </div>
                            </>
                            )}

                    </motion.div>
                        {/*Drop zone indicator between cards */}
                    {dragOverPosition === index + 1 && draggedCard && (
                        <div className="h-2 bg-violet-400 rounded-full mb-2 opacity-80"></div>
                    )}
                </div>
            ))}

            
            {/*Button to add card */}
            {!isAdding && (
            <div className="flex items-center justify-center">
                <button className="bg-white p-1 rounded-full hover:bg-green-300 transition-colors duration-300 cursor-pointer"
                onClick={()=>setIsAdding(true)}>
                    <FaPlus className="w-4 h-4 text-black"></FaPlus>
                </button>
            </div>)}

            {/*Input field for adding new card */}
            {isAdding && (
                    <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 mb-4">
                    <input
                        type="text"
                        placeholder="Card title"
                        value={cardTitle}
                        onChange={(e)=>{setCardTitle(e.target.value)}}
                        className="w-full mb-2 p-1 rounded bg-neutral-700 text-white placeholder-gray-400 outline-none focus:ring-2"
                    />
                    <textarea
                    placeholder="Card description"
                    value={cardDescription}
                    onChange={(e)=>{setCardDescription(e.target.value)}}
                    className="w-full h-20 mb-2 p-2 rounded bg-neutral-700 text-white placeholder-gray-400 outline-none resize-none text-sm focus:ring-2 transition" 
                    />

                    <div className="flex justify-end gap-2">
                        <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition cursor-pointer flex items-center justify-between gap-1"
                        onClick={()=>handleAddCard()}
                        >
                            Add
                            <FiPlus></FiPlus>
                        </button>

                        <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition cursor-pointer"
                        onClick={()=>{setIsAdding(false)}}
                        >
                            Cancel
                        </button>
                    </div>
                    </div>      
            )}

        </div>
    )
}

export default UserColumn