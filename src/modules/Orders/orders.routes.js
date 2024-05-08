import {Router} from 'express'
const router=Router()
import * as oc from './orders.controller.js'
import { isAuth } from '../../middlewares/auth.js'
import { orderApisRoles } from './orders.endpoint.js'
import { validationCoreFunction } from '../../middlewares/validation.js'
import * as validators from './orders.ValidationSchemas.js'
import { asyncHandler } from '../../utils/errorhandling.js'


router.post('/MakeOrder',
isAuth(orderApisRoles.MAKE_ORDER),
validationCoreFunction(validators.createOrderSchema),
asyncHandler(oc.MakeAnOrder)
)

router.post('/Cart2Order',
isAuth(orderApisRoles.MAKE_ORDER),
asyncHandler(oc.carttoOrder)
)

router.patch('/SuccessOrder',  
asyncHandler(oc.PaymentSucess)
)

router.patch('/cancelOrder',
 asyncHandler(oc.cancelpayment))
export default router
