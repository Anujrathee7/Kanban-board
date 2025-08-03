import mongoose, {Document,Schema} from "mongoose";

export interface IBoard extends Document{
    userId: mongoose.Types.ObjectId,
    name: String,
    createdAt: Date,
    updatedAt: Date,
}

const boardSchema: Schema = new Schema<IBoard>({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        default: "My Kanban Board"
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date,
        default: Date.now()
    }
})

boardSchema.pre('save',async function(this:IBoard){
    this.updatedAt = new Date()
})

export default mongoose.model<IBoard>('Board',boardSchema)