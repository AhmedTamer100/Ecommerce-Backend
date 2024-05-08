import {Router} from 'express'
const router=Router()
import * as cp from './coupons.controller.js'
import { isAuth } from '../../middlewares/auth.js'
import { couponApisRoles } from './coupons.endpoints.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import * as validators from './coupon.ValidationSchemas.js'
import { validationCoreFunction } from '../../middlewares/validation.js'

router.post('/AddCoupon',
isAuth(couponApisRoles.CREATE_COUPON),
validationCoreFunction(validators.addCouponSchema),
asyncHandler(cp.AddCoupon)
)

router.put('/updateCoupon/:couponID',
isAuth(couponApisRoles.UPDATE_COUPON),
validationCoreFunction(validators.updateCouponSchema),
asyncHandler(cp.UpdateCoupon)
)

router.delete('/deleteCoupon/:couponID',
isAuth(couponApisRoles.DELETE_COUPON),
asyncHandler(cp.DeleteCoupon)
)

router.get('/allCoupons',
isAuth(couponApisRoles.GET_ALL_COUP),
asyncHandler(cp.GetAllCoupons)
)

export default router
