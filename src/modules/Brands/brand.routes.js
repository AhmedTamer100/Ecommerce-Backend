import {Router} from 'express'
const router=Router()
import * as bc from './brand.controller.js'
import { MulterCloudFun } from '../../services/multerCloud.js'
import { isAuth } from '../../middlewares/auth.js'
import { brandRoles } from './brand.endpoints.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import { AllowedEx } from '../../utils/allowerdExtensions.js'

router.post('/addBrand/:categoryID/:subcategoryID',
MulterCloudFun(AllowedEx.Image).single('logo'),
isAuth(brandRoles.CREATE_BRAND),
asyncHandler(bc.AddBrand)
)

router.put('/updateCat/:categoryID/:subcategoryID/:brandID',
MulterCloudFun(AllowedEx.Image).single('logo'),
isAuth(brandRoles.UPDATE_BRAND),
asyncHandler(bc.UpdateBrand)
)


router.get('/searchFilterBrands',
asyncHandler(bc.specialSearch)
)


export default router
