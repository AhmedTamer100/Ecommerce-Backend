import {Router} from 'express'
const router=Router()
import * as sc from './subcategory.controller.js'
import { isAuth } from '../../middlewares/auth.js'
import { subCategoryRoles } from './subCategory.endpoints.js'
import { MulterCloudFun } from '../../services/multerCloud.js'
import { validationCoreFunction } from '../../middlewares/validation.js'
import * as validators from './subCategory.ValidationSchemas.js'
import { AllowedEx } from '../../utils/allowerdExtensions.js'
import { asyncHandler } from '../../utils/errorhandling.js'

router.post('/addsubCategory/:categoryID',
isAuth(subCategoryRoles.CREATE_SUBCATEGORY),
MulterCloudFun(AllowedEx.Image).single('image'),
validationCoreFunction(validators.createSubCatSchema),
asyncHandler((sc.createSubCategory))
)

router.put('/updateCat/:categoryID/:subcategoryID',
isAuth(subCategoryRoles.UPDATE_SUBCATEGORY),
MulterCloudFun(AllowedEx.Image).single('image'),
validationCoreFunction(validators.updateCategorySchema),
asyncHandler(sc.updatesubCategory)
)

router.get('/getsubCatByFilters',
asyncHandler(sc.getsubCategoryByFilters)
)

router.get('/getallSubCat',
asyncHandler(sc.GetAllsubCat)
)

router.delete('/DeleteSubcategory',
isAuth(subCategoryRoles.DELETE_SUBCATEGORY),
asyncHandler(sc.deletesubCat)

)

export default router
