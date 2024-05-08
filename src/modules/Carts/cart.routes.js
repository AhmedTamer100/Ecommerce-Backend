import {Router} from 'express'
const router=Router()
import * as ca from './cart.controller.js'
import { isAuth } from '../../middlewares/auth.js'
import { systemRoles } from '../../utils/systemRoles.js'
import { asyncHandler } from '../../utils/errorhandling.js'

router.post('/Add2Cart',
isAuth([systemRoles.USER]),
asyncHandler(ca.AddToCart)
)
router.delete('/DeleteFromCart',
isAuth([systemRoles.USER]),
asyncHandler(ca.DeleteFromCart)
)

export default router
