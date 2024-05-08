import Stripe from "stripe"
import { couponModel } from "../../../DB/Models/coupon.model.js"
import { orderModel } from "../../../DB/Models/order.model.js"
import { productModel } from "../../../DB/Models/product.model.js"
import { couponValidationFunction } from "../../utils/couponValidation.js"
import { paymentFunction } from "../../utils/payment.js"
import { qrCodeFunction } from "../../utils/QRCODE.js"
import { Tokengen, verifyToken } from "../../utils/TokenFunction.js"
import { sendEmailAccess } from "../../services/sendEmailService.js"
import { nanoid } from "nanoid"
import createInvoice from "../../utils/pdfkit.js"
import { cartModel } from "../../../DB/Models/cart.model.js"


////////////////Create Order////////////////
export const MakeAnOrder = async(req,res,next)=>{
    const userID =req.authUser._id
    const {
        productID,
        quantity,
        address,
        phoneNo,
        paymentMethod,
        couponCode,
    }=req.body
  
    //////Coupon Check
    if(couponCode){
      const coupon= await couponModel.findOne({couponCode})
      .select('isPercentage isFixedAmount couponAmount couponAssginedToUsers')
      const isCouponValidResult =await couponValidationFunction({couponCode,
        userID,
        next
      })
      if(isCouponValidResult !==true){  
        return next(new Error(isCouponValidResult.msg,{cause:400}))
      }
      req.coupon= coupon
    }
  
    //////Products Check
    const products = []
    const isProductValid = await productModel.findOne({
      _id: productID,
    })
    if (!isProductValid) {
      return next(
        new Error('Product Not Found', { cause: 400 }),
      )
    }
    const productObject = {
      productID,
      quantity,
      title: isProductValid.title,
      price: isProductValid.price_After_Discount,
      finalPrice: isProductValid.price_After_Discount * quantity,
    }
    products.push(productObject)
  
  //////SubTotal Check
  const SubTotal = productObject.finalPrice  
  if(req.coupon?.isFixedAmount && req.coupon?.isPercentage > isProductValid.price_After_Discount){  
    return next(new Error('coupon amount is greater than product price ',{cause:400}))
  }
  /////Paid Amount
  let paidAmount=0
  if(req.coupon?.isPercentage){
    paidAmount = SubTotal * (1-(req.coupon.couponAmount || 0) / 100) 
   }else if(req.coupon?.isFixedAmount){
    paidAmount = SubTotal - req.coupon.couponAmount 
  }else{ //False
  paidAmount = SubTotal 
  }
  ////Payments Method  + orderStatus
  let orderStatus
  paymentMethod =='cash' ? (orderStatus = 'placed') :(orderStatus = 'pending')
  
  const orderObject ={
    userID,
    products,
    address,
    phoneNo,
    orderStatus,
    paymentMethod,
    SubTotal,
    paidAmount,
    couponID:req.coupon?._id,
  }
  const orderDB = await orderModel.create(orderObject)
  if(!orderDB){
    return next(new Error('Failed To Progress Your Order',{cause :400}))
  }
    ///////////payment/////////
  let orderSession
    if (orderDB.paymentMethod == 'card') {
      if (req.coupon) { 
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        let coupon
        if (req.coupon.isPercentage) { 
          coupon = await stripe.coupons.create({
            percent_off: req.coupon.couponAmount, 
          })
        }
        if (req.coupon.isFixedAmount) { 
          coupon = await stripe.coupons.create({
            amount_off: req.coupon.couponAmount * 100,
            currency: 'EGP',
          })
        }
        req.couponID = coupon.id
      }
      const tokenOrder = Tokengen({
        payload: { orderId: orderDB._id },
        signature: process.env.ORDER_TOKEN,
        expiresIn: '1h',
      })
      orderSession = await paymentFunction({
        payment_method_types: [orderDB.paymentMethod],
        mode: 'payment',
        customer_email: req.authUser.email,
        metadata: { orderID: orderDB._id.toString() },
        success_url: `${req.protocol}://${req.headers.host}/order/successOrder?token=${tokenOrder}`, 
        cancel_url: `${req.protocol}://${req.headers.host}/order/cancelOrder?token=${tokenOrder}`, 
        line_items: orderDB.products.map((ele) => {
          return {
            price_data: {
              currency: 'EGP',
              product_data: {
                name: ele.title,
              },
              unit_amount: ele.price * 100,
            },
            quantity: ele.quantity,
          }
        }),
        discounts: req.couponID ? [{ coupon: req.couponID }] : [],
      })
    }
    //increase usuageCount for coupon usage
  if (req.coupon) {
      for (const user of req.coupon.couponAssginedToUsers) {   
        if (user.userId.toString() == userID.toString()) { 
          user.usageCount += 1
        }
      }
      await req.coupon.save()
    }
  
    //decrease products stock by orders product quantity
    await productModel.findOneAndUpdate({_id:productID},{
      $inc:{stock : -parseInt(quantity)} 
    })
  
    ///////GeneraTing Order QRCode///////////
    const orderQr = await qrCodeFunction({data:{orderID:orderDB._id,products:orderDB.products}})  
  
    /////////INVOICE CREATION////////
    const ordercode = `${req.authUser.username}_${nanoid(3)}`
    //////Generate Invoice object (
    const orderinvoice = {  
      shipping:{ 
        name:req.authUser.username,   
        address:orderDB.address,
        city:'Cairo',
        state :'Cairo',
        country : 'Cairo'
      },
      ordercode,
      date:orderDB.createdAt,
      items: orderDB.products,
      subTotal: orderDB.subTotal,
      paidAmount: orderDB.paidAmount,
  
    }
    await createInvoice(orderinvoice, `${ordercode}.pdf`) 
    await sendEmailAccess({
      to:req.authUser.email,
      subject:'Order Confirmation',
      message:'<h1> Please Find Your invoice Pdf below </h1>',
      attachments:[{ 
        path: `./Files/${ordercode}.pdf` 
      }]
    })
    return res.status(201).json({messsage : 'Order In Progress',orderDB,checkOutURL:orderSession.url,orderQr})
  }
  
  
///////////////////Converting Cart to ORDER/////////////////////
export const carttoOrder = async (req, res, next) => {
  const { cartID } = req.query
  const userID = req.authUser._id

  const { paymentMethod, address, phoneNo, couponCode } = req.body
  const cart = await cartModel.findById(cartID)
  if (!cart || !cart.products.length) {
    return next(new Error('Please Fill Your Cart', { cause: 400 }))
  }

  if (couponCode) {
    const coupon = await couponModel
      .findOne({ couponCode })
      .select('isFixedAmount isPercentage couponAmount couponAssginedToUsers')
    const isCouponValid = await couponValidationFunction({
      couponCode,
      userID,
      next,
    }) 
 
    if (!isCouponValid == true) {
      return isCouponValid
    }
    req.coupon = coupon
  }

  //////////products/////////////
  let products = []
  for (const product of cart.products) {
    const productExist = await productModel.findById(product.productID)
    products.push({
      productID: product.productID,
      quantity: product.quantity,
      title: productExist.title,
      price: productExist.price_After_Discount,
      finalPrice: productExist.price_After_Discount * product.quantity,
    })
  }

  ////////////subTotal//////////////
  const subTotal = cart.subTotal

  //////////////////paidAmount/////////////////
  let paidAmount
  if (req.coupon?.isPercentage) {
    paidAmount = subTotal * (1 - (req.coupon?.couponAmount || 0) / 100)
  } else if (req.coupon?.isFixedAmount) {
    paidAmount = subTotal - req.coupon.couponAmount
  } else {
    paidAmount = subTotal
  }

  /////////////////////OrderStatus + paymentMethod //////////////////
  let orderStatus
  paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

  const orderObject = {
    userID,
    products,
    subTotal,
    paidAmount,
    couponID: req.coupon?._id,
    address,
    phoneNo,
    paymentMethod,
    orderStatus,
  }

  const orderDB = await orderModel.create(orderObject)
  if (!orderDB) {
    return next(new Error('Failed To Create Order', { cause: 400 }))
  }
  //////////////////// payment /////////////////////
  let orderSession
  if (orderDB.paymentMethod == 'card') {
    if (req.coupon) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      let coupon
      if (req.coupon.isPercentage) {
        coupon = await stripe.coupons.create({
          percent_off: req.coupon.couponAmount,
        })
      }
      if (req.coupon.isFixedAmount) {
        coupon = await stripe.coupons.create({
          amount_off: req.coupon.couponAmount * 100,
          currency: 'EGP',
        })
      }
      req.couponId = coupon.id
    }
    const tokenOrder = Tokengen({
      payload: { orderID: orderDB._id },
      signature: process.env.ORDER_TOKEN,
      expiresIn: '1h',
    })
    
    orderSession = await paymentFunction({
      payment_method_types: [orderDB.paymentMethod],
      mode: 'payment',
      customer_email: req.authUser.email,
      metadata: { orderID: orderDB._id.toString() },
      success_url: `${req.protocol}://${req.headers.host}/order/successOrder?token=${tokenOrder}`,
      cancel_url: `${req.protocol}://${req.headers.host}/order/cancelOrder?token=${tokenOrder}`,
      line_items: orderDB.products.map((ele) => {
        return {
          price_data: {
            currency: 'EGP',
            product_data: {
              name: ele.title,
            },
            unit_amount: ele.price * 100,
          },
          quantity: ele.quantity,
        }
      }),
      discounts: req.couponID ? [{ coupon: req.couponID }] : [],
    })
  }

  ////////////////// invoice generation ////////////////
  const orderCode = `${req.authUser.userName}_${nanoid(3)}`
  const orderinvoice = {
    orderCode,
    date: orderDB.createdAt,
    shipping: {
      name: req.authUser.username,
      address: orderDB.address,
      city: 'Cairo',
      country: 'cairo',
      state: 'Cairo',
    },
    items: orderDB.products,
    subTotal: orderDB.subTotal,
    paidAmount: orderDB.paidAmount,
  }
  await createInvoice(orderinvoice, `${orderCode}.pdf`)
  const isEmailSent = await sendEmailAccess({
    to: req.authUser.email,
    subject: 'Order Confirmation',
    message: `<h1>please find your invoice attachment below</h1>`,
    attachments: [
      {
        path: `./Files/${orderCode}.pdf`,
      },
    ],
  })
  if (!isEmailSent) {
    return next(new Error('email fail', { cause: 500 }))
  }
  // decrease products stock by quantity
  for (const product of cart.products) {
    await productModel.findOneAndUpdate(
      { _id: product.productID },
      {
        $inc: { stock: -parseInt(product.quantity) },
      },
    )
  }
  // increase coupon Usage
  if (req.coupon) {
    for (const user of req.coupon?.couponAssginedToUsers) {
      if (user.userId.toString() == userID.toString()) {
        user.usageCount += 1
      }
    }
    await req.coupon.save()
  }

  cart.products = []
  await cart.save()
  res.status(201).json({ message: 'Order SuccessFully', orderDB, cart,orderSession})
}

///////////////Success Payment/////////////
export const PaymentSucess=async(req,res,next)=>{
  const {token}=req.query
  const decodedData = verifyToken({token,signature:process.env.ORDER_TOKEN})
  const order = await orderModel.findOne({_id:decodedData.orderID,orderStatus:'pending'})
  if(!order){
    return next(new Error('Invalid Order Id',{cause:400}))
  }
  order.orderStatus='confirmed'
  await order.save()
  res.status(200).json({message:'Order Confirmed',order})
}


///////////////Cancel Payment////////////
export const cancelpayment=async(req,res,next)=>{
  const {token}=req.query
  const decodedData = verifyToken({token,signature:process.env.ORDER_TOKEN})
  const order = await orderModel.findOne({_id:decodedData.orderID})
  if(!order){
    return next(new Error('Invalid orderId',{cause:400}))
  }
  /////////orderStatus = canceled/////////////
  order.orderStatus='canceled'
  await order.save()

  //////////// undo products  and coupon ////////////
  for (const product of order.products) {
    await productModel.findByIdAndUpdate(product.productID, {
      $inc: { stock: parseInt(product.quantity) },
    })
  }

  if (order.couponID) { //Coupon ID Checking
    const coupon = await couponModel.findById(order.couponID)
    if (!coupon) {
      return next(new Error('This Coupon is Expired') , { cause: 400 })
    }
    coupon.couponAssginedToUsers.map((ele) => {
      if (order.userID.toString() == ele.userId.toString()) { 
        ele.usageCount -= 1
      }
    })

    await coupon.save()
  }
  res.status(200).json({ message: 'Your Order is Canceled', order })
}
