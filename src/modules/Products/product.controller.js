import slugify from "slugify"
import { categoryModel } from "../../../DB/Models/Category.model.js"
import { brandModel } from "../../../DB/Models/brand.model.js"
import { subcategoryModel } from "../../../DB/Models/subCategory.model.js"
import { customAlphabet } from "nanoid"
import cloudinary from "../../utils/cloudinaryConfigs.js"
import { productModel } from "../../../DB/Models/product.model.js"
import { PaginationFuction } from "../../utils/pagination.js"
const nanoid=customAlphabet('ATMT=137893!#',6)


export const AddProduct=async(req,res,next)=>{
    const {_id}=req.authUser
    const {title,desc,price,appliedDiscount,colors,sizes,stock}=req.body
    const{categoryID,subcategoryID,brandID}=req.query

    const ifCatExists=await categoryModel.findById(categoryID)
    if(!ifCatExists){
        return next(new Error('Category Not Found'),{cause:400})
    }
    const ifsubCatExists=await subcategoryModel.findById(subcategoryID)
    if(!ifsubCatExists){
        return next(new Error('SubCategory Not Found'),{cause:400})
    }
    const ifBrandExists=await brandModel.findById(brandID)
    if(!ifBrandExists){
        return next(new Error('Brand Not Found'),{cause:400})
    }

    const slug=slugify(title,"_")

    //The main one : price - price *(1-appliedDiscount || 0 /100)
    const price_After_Discount=price*(1-(appliedDiscount || 0)/100)

    if (!req.files) {
        return next(new Error('Uploading Pictures For Product Required', { cause: 400 }))
      }
      const customId = nanoid()
    
      const Images = []
      const publicIds = []
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `${process.env.ECOMM_FOLDER}/Categories/${ifCatExists.name}/subCategories/${ifsubCatExists.name}/brands/${ifBrandExists.customId}/Products/${customId}`,
          },
        )
        Images.push({ secure_url, public_id })
        publicIds.push(public_id)
      }
    const productObject={
        title,
        slug,
        desc,
        price,
        appliedDiscount,
        price_After_Discount,
        colors,
        sizes,
        stock,
        categoryID,
        subcategoryID,
        brandID,
        customId,
        createdBy:_id,
        Images
    }
    
    const product=await productModel.create(productObject)
    if (!product){
        await cloudinary.api.delete_resources(publicIds)
        return next(new Error('Sorry Failed To Create Your Product'),{cause:400})
    }
    res.status(200).json({message:'Product Added Successfully',product})
}

///////////////////////////////// update product /////////////////////////////
export const UpdateProduct=async(req,res,next)=>{
    const {title,desc,price,appliedDiscount,colors,sizes,stock}=req.body
    const{categoryID,subcategoryID,brandID,productID}=req.query

    const product=await productModel.findById(productID)
    if(!product){
        return next(new Error('Product Not Found'),{cause:400})
    }
    const category=await categoryModel.findById(categoryID || product.categoryID)
    if(!category){
        return next(new Error('Category Not Found'),{cause:400})
    }
    const subCategory = await subcategoryModel.findById(subcategoryID || product.subcategoryID)
    if(!subCategory){
        return next(new Error('SubCategory Not Found'),{cause:400})
    }
    const brand=await brandModel.findById(brandID || product.brandID)
    if(!brand){
        return next(new Error('Brand Not Found'),{cause:400})
    }

    if(appliedDiscount && price){  //If Entering A new price and discount For The Product
        const price_After_Discount=price*(1-(appliedDiscount || 0)/100)
        product.price_After_Discount=price_After_Discount
        product.price=price
    }else if(price){//IF Price Only
        const price_After_Discount=price*(1-(appliedDiscount || 0)/100)
        product.price_After_Discount=price_After_Discount
        product.price=price
    }else if(appliedDiscount){  //APPlying New Discount with the current price
        const price_After_Discount=price*(1-(appliedDiscount || 0)/100)
        product.price_After_Discount=price_After_Discount
        product.applied_Discount=appliedDiscount
    }

    if (req.files?.length) {
        let ImageArr = []
        for (const file of req.files) {
          const { secure_url, public_id } = await cloudinary.uploader.upload(
            file.path,
            {
              folder: `${process.env.ECOMM_FOLDER}/Categories/${category.name}/subCategories/${subCategory.name}/brands/${brand.name}/Products/${product.customId}`,
            },
          )
          ImageArr.push({ secure_url, public_id })
        }
        let public_ids = []
        for (const image of product.Images) {
          public_ids.push(image.public_id)
        }
        await cloudinary.api.delete_resources(public_ids)
        product.Images = ImageArr
      }

      if(title){
        product.title=title
        product.slug=slugify(title,"_")
      }

      if(desc) product.desc=desc
      if(colors) product.colors=colors
      if(sizes) product.sizes=sizes
      if(stock) product.stock=stock

      await product.save()
      res.status(200).json({message:'Product Updated Successfully',product})
    
}

///////////////////////////////// delete product /////////////////////////////
export const DeleteProduct=async(req,res,next)=>{
    const{productID}=req.query

    const productExists=await productModel.findByIdAndDelete(productID)
    if(!productExists){
        return next(new Error('Product Not Found'),{cause:400})
    }
    res.status(200).json({message:'Product Deleted Successfully'})
}

///////////////////////////////// get all products /////////////////////////////
export const getAllProd = async (req, res, next) => {
  const { page, size } = req.query
  const { limit, skip } = PaginationFuction({ page, size })

  const productsc = await productModel
    .find()
    .limit(limit)
    .skip(skip)
    .populate([
      {
        path: 'Reviews',
      },
    ])
  res.status(200).json({ message: 'Done', productsc })
}

  export const getProductsByTitle = async (req, res, next) => {
    const { searchKey, page, size } = req.query
    const { limit, skip } = PaginationFuction({ page, size })
  
    const productsc = await productModel
      .find({
        $or: [
          { title: { $regex: searchKey, $options: 'i' } },
          { desc: { $regex: searchKey, $options: 'i' } },
        ],
      })
      .limit(limit)
      .skip(skip)
      .select('price desc')
      .populate([
        {
          path: 'Reviews',
        },
      ])
    res.status(200).json({ message: 'Success', productsc })
  }
  