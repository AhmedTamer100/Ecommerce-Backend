import { couponModel } from "../../../DB/Models/coupon.model.js"
import { usermodel } from "../../../DB/Models/user.model.js"



export const AddCoupon=async(req,res)=>{
    const{
        couponCode,
        couponAmount,
        isPercentage,
        isFixedAmount,
        fromDate,
        toDate,
        couponAssginedToUsers
    }=req.body
    
    const isCouponDuplicated=await couponModel.findOne({couponCode})
    if(isCouponDuplicated){
        return next(new Error('Duplicate Coupon Code', { cause: 400 }))
    }
    if(!isFixedAmount && !isPercentage||isFixedAmount && isPercentage){
        return next(new Error('Please Select Wheather Is Fixed Amount Or Percentage', { cause: 400 }))
    }
    
    //Coupons Assigned To Users
    // const userIds=[]
    let userIds = [];
    if (couponAssginedToUsers) {
        userIds = couponAssginedToUsers
        .filter(user => user.userIds) // Filter out users without userIds
        .map(user => user.userIds.userIds)
}

    const userCheck=await usermodel.find({
        _id:{
            $in:userIds
        }
    })

    if(userIds.length!=userCheck.length){
        return next(new Error('Invalid User IDs', { cause: 400 }))
    }
    
    const CouponObject={
        couponCode,
        couponAmount,
        isPercentage,
        isFixedAmount,
        fromDate,
        toDate,
        couponAssginedToUsers,
        createdBy:req.authUser._id
    }
    
    const coupon= await couponModel.create(CouponObject)
    if(!coupon){
        return next(new Error('Failed To Add Coupon', { cause: 400 }))
    }
    res.status(201).json({message:'Coupon Added SuccessFully',coupon})
}

////////////////////////////////////////Update Coupon/////////////////////////////////////
export const UpdateCoupon=async(req,res,next)=>{
    const {
        couponCode,
        couponAmount,
        isPercentage,
        isFixedAmount,
        fromDate,
        toDate,
        couponAssginedToUsers
        }=req.body
        const{couponID}=req.params

    const couponCheck=await couponModel.findById(couponID)
    if(!couponCheck){
        return next(new Error('Invalid Coupon', { cause: 400 }))
    }

    if(couponCode) couponCheck.couponCode=couponCode
    if(couponAmount) couponCheck.couponAmount=couponAmount
    if(isPercentage) couponCheck.isPercentage=isPercentage
    if(isFixedAmount) couponCheck.isFixedAmount=isFixedAmount
    if(fromDate) couponCheck.fromDate=fromDate
    if(toDate) couponCheck.toDate=toDate
    if(couponAssginedToUsers) couponCheck.couponAssginedToUsers=couponAssginedToUsers

   await couponCheck.save() 
   res.status(200).json({message:'Coupon Updated SuccessFully',couponCheck})
}

//////////////////////////////////////////Delete Coupon/////////////////////////////////////
export const DeleteCoupon=async(req,res,next)=>{
    const{couponID}=req.params
    
    const ifCouponExist=await couponModel.findByIdAndDelete(couponID)
    if(!ifCouponExist){
        return next(new Error('Invalid CouponID', { cause: 400 }))
    }
    res.status(200).json({message:'Coupon Deleted SuccessFully',ifCouponExist})
}

///////////////////////////////////////////Get All Coupon/////////////////////////////////////
export const GetAllCoupons=async(req,res,next)=>{
    const coupons=await couponModel.find()
    res.status(200).json({message:'All Coupons :',coupons})
}