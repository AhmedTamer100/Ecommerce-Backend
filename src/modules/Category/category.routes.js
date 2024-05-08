import {Router} from 'express'
const router=Router()
import * as cs from './category.controller.js'
import { isAuth } from '../../middlewares/auth.js'
import { CategoryRoles } from './Category.endpoints.js'
import { MulterCloudFun } from '../../services/multerCloud.js'
import { AllowedEx } from '../../utils/allowerdExtensions.js'
import { validationCoreFunction } from '../../middlewares/validation.js'
import * as validators from './categoryValidationSchemas.js'
import { asyncHandler } from '../../utils/errorhandling.js'

router.post('/addcategory',
isAuth(CategoryRoles.CREATE_CATEGORY),
MulterCloudFun(AllowedEx.Image).single('image'),
validationCoreFunction(validators.createCategorySchema),
asyncHandler((cs.createCategory))
)

router.put('/updatecategory/:categoryID',
isAuth(CategoryRoles.UPDATE_CATEGORY),
MulterCloudFun(AllowedEx.Image).single('image'),
validationCoreFunction(validators.updateCategorySchema),
asyncHandler(cs.UpdateCat))

router.get('/getallcategories',
asyncHandler(cs.GetAllCat))

router.delete('/deletecategory',
isAuth(CategoryRoles.DELETE_CATEGORY),
asyncHandler(cs.DeletCat))

router.get('/getCatByFilters',
asyncHandler(cs.getCategoryByFilters))


export default router

