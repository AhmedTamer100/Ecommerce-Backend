import slugify from "slugify"
import { categoryModel } from "../../../DB/Models/Category.model.js"
import { subcategoryModel } from "../../../DB/Models/subCategory.model.js"
import { customAlphabet } from "nanoid"
import cloudinary from "../../utils/cloudinaryConfigs.js"
import { brandModel } from "../../../DB/Models/brand.model.js"
import { ForApiFeatures } from "../../utils/apiFeatures.js"
const nanoid=customAlphabet('1234567_=!AHTESOZ',6)


export const AddBrand=async(req,res,next)=>{
    const{_id}=req.authUser
    const{name}=req.body
    const{categoryID,subcategoryID}=req.params

    const subCategoryExist=await subcategoryModel.findById(subcategoryID)
    const categoryExist=await categoryModel.findById(categoryID)

    if(!subCategoryExist || !categoryExist){
        return next(new Error('Categories Not Found'),{cause:400})
    }

    if (await brandModel.findOne({ name })) {
        return next(
          new Error('Please Enter Different Brand', { cause: 400 }),
        )
      }
    const slug=slugify(name,{
        replacement:'_',
        lower:true
    })

    if(!req.file){
        return next(new Error('please upload a brand logo'),{cause:400})
    }

    const customId=nanoid()
    //Host
    const{secure_url,public_id}=await cloudinary.uploader.upload(
        req.file.path,
        {
            folder:`${process.env.ECOMM_FOLDER}/Categories/${categoryExist.name}/subCategories/${subCategoryExist.name}/brands/${customId}`
        },
    )

    const BrandObject={
        name,
        slug,
        Logo:{
            secure_url,
            public_id
        },
        subcategoryID,
        categoryID,
        customId,
        createdBy:_id
    }
    const Brand=await brandModel.create(BrandObject)
    if(!Brand){
        await cloudinary.uploader.destroy(public_id)
        return next(new Error('Failed To Add Brand,Please Try Again'),{cause:400})
    }
    res.status(201).json({message:'Brand Added SuccessFully',Brand})
}

/////////////////////////Update Brand///////////////////////////
export const UpdateBrand= async(req,res,next)=>{
    const {name}=req.body
    const {categoryID,subcategoryID}=req.query
    
    const brand=await brandModel.findById(req.params.brandID)
    if(!brand){
      return next (new Error('Invalid Brand id',{cause :400}))
    }
    const categoryExists =await categoryModel.findById(categoryID || brand.categoryID)
    if(!categoryExists){
      return next(new Error('invalid CategoryId'),{cause:400})
    }
    const subcategoryExists = await subcategoryModel.findById(subcategoryID || brand.subcategoryID)
    if(!subcategoryExists){
      return next(new Error('invalid subCatId'),{cause:400})
    }
   
    if (name) {
        // different from old name
        if (brand.name == name.toLowerCase()) {
          return next(
            new Error('please enter different name from the old brand name', {
              cause: 400,
            }),
          )
        }
        // unique name
        if (await categoryModel.findOne({ name })) {
          return next(
            new Error('please enter different brand name , duplicate name', {
              cause: 400,
            }),
          )
        }
    
        brand.name = name
        brand.slug = slugify(name, '_')
      }

    if (req.file) {
        await cloudinary.uploader.destroy(brand.Logo.public_id)
    
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder:`${process.env.ECOMM_FOLDER}/Categories/${categoryExists.name}/subCategories/${subcategoryExists.name}/brands/${brand.customId}`,
          },
        )
        // db
        brand.Logo = { secure_url, public_id }
  
      }
   await brand.save()
   res.status(200).json({message:'Updated SuccessFully',brand})
  
  }

///////////////////////////Delete Brand////////////////////////////
//   export const delBrand= async(req,res,next)=>{
//     const{_id}=req.authUser
//     const{categoryID,subcategoryID,brandID}=req.query
    
//     //Checking CategoryId
//     const categoryExists =await categoryModel.findById(categoryId||categoryId.subcategoryExists)
//     if(!categoryExists){
//       return next(new Error('invalid categoryId',{cause :400}))
//     }
  
//     //Checking subCategoryId
//     const subcategoryExists = await subCategoryModel.findById(subCategoryId)
//     if(!subcategoryExists){
//       return next(new Error('invalid subCategoryId',{cause :400}))
//     }
//     //Deleting Images
//     cloudinary.uploader.destroy(subcategoryExists.Image.public_id)
//     await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Categories/${categoryExists.customId}/subCategories/${subcategoryExists.customId}`) 
//     //Deleting From DB
//     const deleteRelatedBrandsCategories = await brandModel.deleteMany({subCategoryId})
//     const deleteRelatedProducts = await productModel.deleteMany({subCategoryId})
    
//     if (!deleteRelatedBrandsCategories.deletedCount){
//       return next(new Error('Failed to Delete Brand ', { cause: 400 }))
//     }
//     if (!deleteRelatedProducts.deletedCount){
//       return next(new Error('Failed to Delete product ', { cause: 400 }))
//     }
  
//     //Deleting Subcat
//       const subCat= await subCategoryModel.findByIdAndDelete(subCategoryId)
  
//       if(!subCat){
//       return next (new Error('Invalid SubCategoryId',{cause:400}))
//     }
//       res.status(200).json({message:'Deleted Succesfully',subCat})
//   }
    






  export const specialSearch = async(req,res,next)=>{
    const ApiFeaturesInstance =new ForApiFeatures(brandModel.find({}),req.query).pagination().Filters().Sort()
    const brands = await ApiFeaturesInstance.MongQuery
    res.status(200).json({ message: 'Done', brands })
  }
  