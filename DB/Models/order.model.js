import { Schema, model } from "mongoose";

const OrderSchema =new Schema({
    userID:{  //User Logged In
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products:[ //Products IN the ORDER
      {
        productID:{
            type:Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            default:1
        },
        title:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        finalPrice:{  //price*quantity
            type:Number,
            required:true
        },

      },
    ],
    subTotal:{ //Final Prices IN all Array
        type:Number,
        default:0,
        required:true
    },
    couponID:{
        type:Schema.Types.ObjectId,
        ref:'Coupon'
    },
    paidAmount:{ //Final at the end even if there is coupon
        type:Number,
        default:0,
        required:true
    },
    //For Client Service
    address:{
        type:String,
        required:true
    },
    phoneNo:[{  //Maybe More Than One Phone
        type:String,
        required:true
    }],
    orderStatus:{
        type:String,
        enum: [
            'pending',  
            'confirmed',  
            'placed', 
            'preparation',
            'on way',  
            'delivered',
            'canceled',
          ],
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'card'],
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      canceledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
},{
    timestamps:true
}
)

export const orderModel=model('Order',OrderSchema)
