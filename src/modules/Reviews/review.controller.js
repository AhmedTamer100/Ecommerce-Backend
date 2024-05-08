import { orderModel } from "../../../DB/Models/order.model.js"
import { productModel } from "../../../DB/Models/product.model.js"
import { reviewModel } from "../../../DB/Models/review.model.js"


/////////////////Add Review////////////////
export const AddReview=async(req,res,next)=>{
    const userID=req.authUser._id
    const{productID}=req.query

    const isProductExistToBeReviewed=await orderModel.findOne({
        userID,
        'products.productID':productID,
        orderStatus:'Delivered'
    })
    if(!isProductExistToBeReviewed){
        return next(new Error('You Should Buy This Product First'),{cause:400})
    }

    const {reviewRate , reviewComment}=req.body
    const reviewObject={
        userID,
        productID,
        reviewRate,
        reviewComment
    }

    const review_DB=await reviewModel.create(reviewObject)
if(!review_DB){
    return next(new Error('Failed To Add Review On This Product'),{cause:400})
}

const product=await productModel.findById(productID)
const review=await reviewModel.find({productID})

let sumRates=0
for(const reviewItem of review){
    sumRates +=reviewItem.reviewRate
}
product.rate=Number(sumRates/review.length).toFixed(2)
await product.save()

res.status(200).json({message:'Review Added Successfully',review_DB,product})
}