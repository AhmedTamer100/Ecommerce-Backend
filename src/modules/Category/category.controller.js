import { nanoid } from "nanoid"
import slugify from "slugify"
import cloudinary from "../../utils/cloudinaryConfigs.js"
import { categoryModel } from "../../../DB/Models/Category.model.js"
import { ForApiFeatures } from "../../utils/apiFeatures.js"
import { PaginationFuction } from "../../utils/pagination.js"
import { brandModel } from "../../../DB/Models/brand.model.js"
import { productModel } from "../../../DB/Models/product.model.js"
import { subcategoryModel } from "../../../DB/Models/subCategory.model.js"



////////////////////////////////Creating Category///////////////////////////////

export const createCategory = async (req, res, next) => {
    const { _id } = req.authUser
    const { name } = req.body
    const slug = slugify(name, '_')
  
    if (await categoryModel.findOne({ name })) {
      return next(
        new Error('Please Enter Different Category Name', { cause: 400 }),
      )
    }
  
    if (!req.file) {
      return next(new Error('Required Adding Category Image', { cause: 400 }))
    }
  
    // host
    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.ECOMM_FOLDER}/Categories/${customId}`,
      },
    )
    const categoryObject = {
      name,
      slug,
      Image: {
        secure_url,
        public_id,
      },
      name:name.toLowerCase(),
      createdBy: _id,
    }
  
    const category = await categoryModel.create(categoryObject)
    if (!category) {
      await cloudinary.uploader.destroy(public_id)
      return next(
        new Error('Failed To Add Category , Please Try Again Later', { cause: 400 }),
      )
    }
  
    res.status(200).json({ message: 'Added Category SuccessFully', category })
  }

//////////////////////////////////Update Category////////////////////////////
export const UpdateCat = async (req, res, next) => {
    const { _id } = req.authUser
    const { categoryID } = req.params
    const { name } = req.body
    const category = await categoryModel.findOne({
      _id: categoryID,
      createdBy: _id,
    })
    if (!category) {
      return next(new Error('In-valid category id', { cause: 400 }))
    }
  
    if (name) {
      // different from old name
      if (category.name == name.toLowerCase()) {
        return next(
          new Error('please enter different name from the old category name', {
            cause: 400,
          }),
        )
      }
      // unique name
      if (await categoryModel.findOne({ name })) {
        return next(
          new Error('please enter different category name , duplicate name', {
            cause: 400,
          }),
        )
      }
  
      category.name = name
      category.slug = slugify(name, '_')
    }
  
    if (req.file) {
      // delete the old category image
      await cloudinary.uploader.destroy(category.Image.public_id)
  
      // upload the new category image
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `${process.env.ECOMM_FOLDER}/Categories/${category._id}`,
        },
      )
      // db
      category.Image = { secure_url, public_id }

    }
    category.updatedBy = _id
    await category.save()
    res.status(200).json({ message: 'Updated Done', category })
  }

////////////////////////////////Delete Category///////////////////////////////
export const DeletCat = async (req, res, next) => {
  const { _id } = req.query

  // check category id
  const categoryExists = await categoryModel.findOneAndDelete(categoryID)
  if (!categoryExists) {
    return next(new Error('Category Not Found', { cause: 400 }))
  }

  ///////////// Delete from DB///////////
  const deleteRelatedSubCategories = await subcategoryModel.deleteMany({
    categoryID,
  })

  if (!deleteRelatedSubCategories.deletedCount) {
    return next(new Error('FAILED TO DELETE SUBCATEGORY', { cause: 400 }))
  }
  const deleteRelatedBrands = await brandModel.deleteMany({
    categoryID,
  })
  if (!deleteRelatedBrands.deletedCount) {
    return next(new Error('FAILED TO DELETE BRAND', { cause: 400 }))
  }
  const deleteRelatedProducts = await productModel.deleteMany({
    categoryID,
  })
  if (!deleteRelatedProducts.deletedCount) {
    return next(new Error('FAILED TO DELETE PRODUCT', { cause: 400 }))
  }
  ///////////////Delete from cloudinary//////////////
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.ECOMM_FOLDER}/Categories/${categoryExists.customId}`,
  )

  await cloudinary.api.delete_folder(
    `${process.env.ECOMM_FOLDER}/Categories/${categoryExists.customId}`,
  )

  res.status(200).json({ messsage: 'Deleted SuccessFully' })
}


////////////////////////////////Get Category By Title///////////////////////////////
export const getCategoryByFilters = async (req, res, next) => {
    const { searchKey, page, size } = req.query
    const { limit, skip } = PaginationFuction({ page, size })

    try {
        const regex = new RegExp(searchKey, 'i')
        const categorysc = await categoryModel
            .find({ name: regex })
            .limit(limit)
            .skip(skip)

        if (categorysc.length === 0) {
            console.log(`No categories found for searchKey: ${searchKey}`)
        } else {
            console.log(`Found ${categorysc.length} category for this searchKey: ${searchKey}`)
        }

        res.status(200).json({ message: 'Success', categorysc })
    } catch (error) {
        console.error(`Error retrieving categories: ${error}`)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
  
  
  ////////////////////////////////Get All category with subcategory with their Brands///////////////////////////////
export const GetAllCat =async(req,res,next)=>{
    const Categories=await categoryModel.find().populate([{
        path:'subCategories',
       populate:({
          path:'Brands',
          select:'name'
            
      })
    },
])
res.status(200).json({message:'Success',Categories})

}