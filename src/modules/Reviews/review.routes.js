import {Router} from 'express'
const router=Router()
import * as rc from './review.controller.js'
import { isAuth } from '../../middlewares/auth.js'
import { reviewApisRoles } from './review.endpoints.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import { validationCoreFunction } from '../../middlewares/validation.js'
import * as validators from './Review.ValidationSchemas.js'

router.post('/AddReview',
    isAuth(reviewApisRoles.ADD_REVIEW),
    validationCoreFunction(validators.addReviewSchema),
    asyncHandler(rc.AddReview)
)
export default router
