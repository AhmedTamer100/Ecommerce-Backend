import { Schema, model } from 'mongoose'

const reviewSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,  //Should Be a User Bought That Product Not Just reviewing 
    },
    productID: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    reviewRate: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5],
    },
    reviewComment: { type: String },
  },
  {
    timestamps: true,
  },
)

export const reviewModel = model('Review', reviewSchema)