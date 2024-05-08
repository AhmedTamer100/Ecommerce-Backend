import { Schema, model } from 'mongoose'

const cartSchema = new Schema(
  {
    userID: {   //Should Be A logged user To be Able To Save in Cart
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },
    products: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
)

export const cartModel = model('Cart', cartSchema)