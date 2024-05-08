import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
{
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
    Image:{
        secure_url:{
            type:String,
            required:true
        },
        public_id:{
            type:String,
            required:true
        }
},  
    customId:String,

    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    updatedBy:{
        type: Schema.Types.ObjectId,
        ref:'User',
    },
    categoryID:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true        
},
},{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps:true
})
    subCategorySchema.virtual('Brands',{   //queries the brand model and retrieve all brand objects that have
        ref:'Brand',                       // the same subCategoryId
        foreignField:'subcategoryID',
        localField:'_id'
    })

export const subcategoryModel=model('SubCategory',subCategorySchema)