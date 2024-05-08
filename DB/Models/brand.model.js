import { Schema, model } from "mongoose";

const BrandSchema = new Schema({
    name:{
        type:String,
        lowercase:true,
        required:true
},
    slug:{
        type:String,
        unique:true,
        lowercase:true,
        required:true
},
    Logo:{
        secure_url:{ 
            type:String,
            required:true
        },
        public_id:{  
            type:String,
            required:true
        }
},customId:String,
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
},
    subcategoryID:{
        type:Schema.Types.ObjectId,
        ref:'SubCategory',
        required:true
},
    categoryID:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true
}},

{
    timestamps:true
}
)

export const brandModel=model('Brand',BrandSchema)