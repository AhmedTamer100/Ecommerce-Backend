import { Schema, model } from "mongoose";

const productSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true,
        lowercase:true
    },
    desc:String,
    colors:[String],
    sizes:[String],
    price:{
        type:Number,
        required:true,
        default:1
    },
    applied_Discount:{
        type:Number,
        default:0
    },
    price_After_Discount:{
        type:Number,
        default:0
    ,
    },
    stock:{
        type:Number,
        required:true,
        default:1
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    deletedBy:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    categoryID:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    subcategoryID:{
        type:Schema.Types.ObjectId,
        ref:'SubCategory',
        required:true
    },
    brandID:{
        type:Schema.Types.ObjectId,
        ref:'Brand',
        required:true
    },
    Images: [
        {
          secure_url: {
            type: String,
            required: true,
          },
          public_id: {
            type: String,
            required: true,
          },
        },
      ],
    //   rate: {
    //     type: Number,
    //     default: 0,
    //     required: true,
    //   },
    customId:String,

},{
    timestamps:true
}
)
productSchema.virtual('Reviews',{
    ref:'Review',
    foreignField:'productID',
    localField:'_id'
})

export const productModel=model('Product',productSchema)