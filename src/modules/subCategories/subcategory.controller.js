import { customAlphabet } from "nanoid"
import { categoryModel } from "../../../DB/Models/Category.model.js"
import { subcategoryModel } from "../../../DB/Models/subCategory.model.js"
import slugify from "slugify"
import cloudinary from "../../utils/cloudinaryConfigs.js"
import { PaginationFuction } from "../../utils/pagination.js"
import { brandModel } from "../../../DB/Models/brand.model.js"
import { productModel } from "../../../DB/Models/product.model.js"
const nanoid = customAlphabet('1234567_=!AHTESOZ', 6)


export const createSubCategory=async(req,res,next)=>{
    const {_id}=req.authUser
    const{categoryID}=req.params
    const{name}=req.body

    const category=await categoryModel.findById(categoryID)
    if(!category){
        return next(new Error('in-valid category id', {cause: 400}))
    }
    const CheckUniqueName=await subcategoryModel.findOne({name})
    if(CheckUniqueName){
        return next(new Error('subCategory Already Exist , Please Enter Different Name', {cause: 400}))
    }
    const slug=slugify(name,'_')

    if(!req.file){
        return next(new Error('please upload a subcategory Image', {cause: 400}))
    }

   const customId=nanoid()
    //Host
   const{secure_url,public_id}=await cloudinary.uploader.upload(
    req.file.path,{
       folder:`${process.env.ECOMM_FOLDER}/Categories/${category.name}/subCategories/${customId}`
   })

   const subCategoryObject={
    name,
    slug,
    customId,
    Image:{
        secure_url,
        public_id
    },
    categoryID, //SubCategory Belong To Which Category
    createdBy: _id,
   }
   const subCat=await subcategoryModel.create(subCategoryObject)
   if(!subCat){
    await cloudinary.uploader.destroy(public_id)
    return next(new Error('Failed To Create SubCategory , Try Again Later', {cause: 400}))
   }
   res.status(201).json({message:'subCategory Added SuccessFully', subCat})
}

///////////////////////update subCategory///////////////////////////
export const updatesubCategory =async(req,res,next)=>{
    const {_id}=req.authUser
    const{categoryID,subcategoryID}=req.params
    const{name}=req.body
    
    const subcat = await subcategoryModel.findOne({
        _id:subcategoryID,
        createdBy:_id
    })
    if(!subcat){
      return next (new Error('Invalid subCategoryId',{cause :400}))
    }
    const categoryExists =await categoryModel.findById(categoryID || subcat.categoryID)
    
    if(categoryExists){
      if(!categoryExists){
        return next(new Error('invalid Category'),{cause:400})
      }
      subcat.categoryID=categoryID
    }

    if (name) {
        // different from old name
        if (subcat.name == name.toLowerCase()) {
          return next(
            new Error('please enter different name from the old subCategory name', {
              cause: 400,
            }),
          )
        }
        // unique name
        if (await subcategoryModel.findOne({ name })) {
          return next(
            new Error('please enter different subCategory name , duplicate name', {
              cause: 400,
            }),
          )
        }
    
        subcat.name = name
        subcat.slug = slugify(name, '_')
      }
    
  
    if(req.files?.length){
     let ImageArr=[]
     for (const file of req.files) {
      const {secure_url,public_id}=await cloudinary.uploader.upload(
        file.path,{
          folder: `${process.env.ECOMM_FOLDER}/Categories/${categoryExists.name}/subCategories/${customId}`
        },
      )
      ImageArr.push(secure_url,public_id)
     }
     let public_ids=[]
     for (const image of subcat.Image) {
      public_ids.push(image.public_id)
     }
     await cloudinary.api.delete_resources(public_ids)
     subcat.Image=ImageArr
    }


    subcat.updatedBy=_id
    await subcat.save()
    res.status(200).json({message:'Updated SuccessFully',subcat})
  }

/////////////////////////Get All subCategory////////////////////////////

export const GetAllsubCat =async(req,res,next)=>{
    const subCat=await subcategoryModel.find().populate([{
        path:'subCategories',
       populate:({
            path:'Brands',
            select:'name'
            
      })
   },
])
res.status(200).json({message:'Success',subCat})

}
//////////////////Get All subCategory By Filters////////////////////////////
  export const getsubCategoryByFilters = async (req, res, next) => {
    const { searchKey, page, size } = req.query
    const { limit, skip } = PaginationFuction({ page, size })

    try {
        const regex = new RegExp(searchKey, 'i')
        const subcatsc = await subcategoryModel
            .find({ name: regex })
            .limit(limit)
            .skip(skip)

        if (subcatsc.length === 0) {
            console.log(`No Subcategories found for searchKey: ${searchKey}`)
        } else {
            console.log(`Found ${subcatsc.length} Subcategories for this searchKey: ${searchKey}`)
        }

        res.status(200).json({ message: 'Success', subcatsc })
    } catch (error) {
        console.error(`Error retrieving subCategories: ${error}`)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
  
  /////////////////////////Delete subCategory////////////////////////////
  export const deletesubCat= async(req,res,next)=>{
    const{_id}=req.authUser
    const{subcategoryID,categoryID}=req.query
    
    //Checking CategoryId
    const categoryExists =await categoryModel.findById(categoryID||categoryID.subcategoryExists)
    if(!categoryExists){
      return next(new Error('invalid category',{cause :400}))
    }
  
    //Checking subCategoryId
    const subcategoryExists = await subcategoryModel.findById(subcategoryID)
    if(!subcategoryExists){
      return next(new Error('invalid subcategory',{cause :400}))
    }
    //Deleting Images
    cloudinary.uploader.destroy(subcategoryExists.Image.public_id)
    await cloudinary.api.delete_resources_by_prefix(`${process.env.ECOMM_FOLDER}/Categories/${categoryExists.name}/subCategories/${subcategoryExists.customId}`) 
    //Deleting From DB
    const deleteRelatedBrandsCategories = await brandModel.deleteMany({subcategoryID})
    const deleteRelatedProducts = await productModel.deleteMany({subcategoryID})
    
    if (!deleteRelatedBrandsCategories.deletedCount){
      return next(new Error('Failed to Delete Brand ', { cause: 400 }))
    }
    if (!deleteRelatedProducts.deletedCount){
      return next(new Error('Failed to Delete product ', { cause: 400 }))
    }
  
    //Deleting Subcat
      const subCat= await subcategoryModel.findByIdAndDelete(subcategoryID)
  
      if(!subCat){
      return next (new Error('Failed To Delete subCategory',{cause:400}))
    }
      res.status(200).json({message:'Deleted Succesfully',subCat})
  }
    