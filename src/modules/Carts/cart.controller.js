import { cartModel } from "../../../DB/Models/cart.model.js"
import { productModel } from "../../../DB/Models/product.model.js"


//////////////////Add To Cart////////////////
export const AddToCart=async(req,res,next)=>{
    const userID=req.authUser._id
    const{productID,quantity}=req.body

    const productCheck =await productModel.findOne({
        _id:productID,
        stock:{$gte:quantity}
    })
    if(!productCheck){
        return next(new Error('Product Not Found'),{cause:400})
    }

    const UserCart = await cartModel.findOne({
        userID
    }).lean()

    if(UserCart){
        //Update Quantity
        let productExist = false
        for(const product of UserCart.products){
            if(productID==product.productID){
                productExist=true
                product.quantity=quantity
        }
    }
    //Pushing New Product
    if(!productExist){
        UserCart.products.push({  //IF Doesn't Exist push Values From the Beginning
            productID,
            quantity
        })
    }
    //SubTotal
    let subTotal=0
    for(const product of UserCart.products){
        const productExists =await productModel.findById(product.productID)
        subTotal+=productExists.price_After_Discount*product.quantity || 0
    }

    const NewCart= await cartModel.findOneAndUpdate(
        {userID},
        {subTotal,products:UserCart.products},
        {new:true}
    )//New DB
    return res.status(200).json({message:'Added To Cart SuccessFully',NewCart})
}
    const cartObject={
        userID,
        products:[{productID,quantity}],
        subTotal:productCheck.price_After_Discount*quantity
    }
    
    const cartDB= await cartModel.create(cartObject)
    return res.status(201).json({message:'Added To Cart SuccessFully',cartDB})
}


export const DeleteFromCart = async (req, res, next) => {
    const userID = req.authUser._id
    const { productID } = req.body
  
  
    const productCheck = await productModel.findOne({
      _id: productID,
    })
    if (!productCheck) {
      return next(new Error('Product Not Found', { cause: 400 }))
    }
  
    const userCart = await cartModel.findOne({
      userID,
      'products.productID': productID,
    })
    if (!userCart) {
      return next(new Error('Product Not Found', { cause: 400 }))
    }
    userCart.products.forEach((ele) => {
      if (ele.productID == productID) { //Delete The MatChing Product ID
        userCart.products.splice(userCart.products.indexOf(ele), 1) //Deleting This Product Individually
      }
    })
    await userCart.save()
    res.status(200).json({ message: 'Deleted SuccesSsFully', userCart })
  }