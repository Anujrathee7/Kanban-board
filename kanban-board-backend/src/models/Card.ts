import mongoose, {Document,Schema} from "mongoose";

export interface ICard extends Document{
    columnID: mongoose.Types.ObjectId,
    title: string,
    description?: string,
    position: number,
    color?: string,
    createdAt: Date,
    updatedAt: Date,
}

const cardSchema: Schema = new Schema<ICard>({
    columnID:{
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Column'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        trim: true
    },
    position:{
        required: true,
        type: Number,
        default: 0
    },
    color:{
        type: String,
        default: '#ffffff',
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

cardSchema.pre('save',async function(this: ICard){
    this.updatedAt = new Date();  
})

export default mongoose.model<ICard>('Card',cardSchema)