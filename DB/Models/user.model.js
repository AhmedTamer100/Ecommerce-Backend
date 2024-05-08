import { Schema, model, set } from "mongoose";
import { systemRoles } from "../../src/utils/systemRoles.js";
import bcrypt from 'bcrypt'

const userSchema=new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        default:function(){
            return (this.firstname + this.lastname).toLowerCase()
        }
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        set: function(password){
            return bcrypt.hashSync(password,+process.env.SALT_ROUNDS)
        }
    },
    day:{
        type:Number,
        required:true
      },
    month:{
        type:Number,
        required:true
      },
    year:{
        type:Number,
        required:true
      },
    Age:{
        type:Number,
        default:function(){
            const data_of_birth = new Date(this.year,this.month,this.day)
            const ageDiffwithMs=Date.now() - data_of_birth
            const ageDate = new Date(ageDiffwithMs)
            return Math.abs(ageDate.getUTCFullYear() - 1970)
        }
      },
    gender:{
        type:String,
        default:'Not specified',
        enum:['male','female']
    },
    phoneNumber:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },profile_pic:{
        secure_url:String,
        public_id:String
    },
    isConfirmed:{
        type:Boolean,
        required:true,
        default:false
    },
    role:{
        type:String,
        required:true,
        default:systemRoles.USER,
        enum:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]
    },
    IsOnline:{
        type:Boolean,
        default:false
      },
    token:String,
    forgetCode:String,
},{
    timestamps:true
}
)

export const usermodel=model('User',userSchema)


