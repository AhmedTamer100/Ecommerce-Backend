import { Schema, model } from 'mongoose'

const categorySchema=new Schema({
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
    customId:{
        type:String,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    updatedBy:{
        type: Schema.Types.ObjectId,
        ref:'User',
    }
},
{
    toObject: { virtuals: true }, // for res.json()
    toJSON: { virtuals: true }, // for console.log()                  
    timestamps:true
}
)

categorySchema.virtual('subCategories',{
    ref:'SubCategory',
    foreignField:'categoryID',
    localField:'_id'
})

categorySchema.virtual('Brands',{
    ref:'Brand',
    foreignField:'categoryID',
    localField:'_id'
})

export const categoryModel=model('Category',categorySchema)