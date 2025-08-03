import mongoose, {Document,Schema} from "mongoose";

export interface IColumn extends Document{
    boardId: mongoose.Types.ObjectId,
    title: string,
    position: number,
    createdAt: Date,
    updatedAt: Date
};

const columnSchema: Schema = new Schema<IColumn>({
    boardId:{
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Board'
    },
    title:{
        type: String,
        required: true,
        trim: true
    },
    position:{
        type: Number,
        required: true,
        default: 0
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

columnSchema.pre('save',async function(this: IColumn){
    this.updatedAt = new Date();
})

export default mongoose.model<IColumn>('Column',columnSchema)