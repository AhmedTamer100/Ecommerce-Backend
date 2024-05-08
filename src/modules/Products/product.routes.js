import {Router} from 'express'
const router=Router()
import * as pc from './product.controller.js'
import { isAuth } from '../../middlewares/auth.js'
import { validationCoreFunction } from '../../middlewares/validation.js'
import * as validators from './product.ValidationSchemas.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import { ProductRoles } from './product.endpoints.js'
import { MulterCloudFun } from '../../services/multerCloud.js'
import { AllowedEx } from '../../utils/allowerdExtensions.js'

router.post('/AddProduct',
MulterCloudFun(AllowedEx.Image).array('image',3),
isAuth(ProductRoles.CREATE_PRODUCT),
validationCoreFunction(validators.AddProductSchema),
asyncHandler(pc.AddProduct)
)

router.put('/UpdateProduct',
MulterCloudFun(AllowedEx.Image).array('image',2),
isAuth(ProductRoles.UPDATE_PRODUCT),
validationCoreFunction(validators.updateProductSchema),
asyncHandler(pc.UpdateProduct)
)

router.delete('/deleteProduct',
isAuth(ProductRoles.DELETE_PRODUCT),
asyncHandler(pc.DeleteProduct)
)

router.get('/getAllProducts',
asyncHandler(pc.getAllProd)
)

router.get('/FilterSearch',
asyncHandler(pc.getProductsByTitle),
)


export default router
