import mongoose, { Schema,Document} from "mongoose";
import bcrypt from 'bcryptjs';

//Creating model for user for mongodb

export interface IUser extends Document{
    email: string,
    password: string,
    name:string,
    createdAt: Date,
    comparePassword(userPassword: string): Promise<boolean>   
}


const userSchema: Schema = new Schema<IUser>({
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password:{
        type:String,
        required: true,
        trim: true,
    },
    name:{
        type: String,
        required: true,
        trim: true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
});

//Hash password before saving into DB
 userSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(this:IUser, userPassword: string): Promise<boolean> {
    return bcrypt.compare(userPassword,this.password)
}

export default mongoose.model<IUser>('User',userSchema)

