import Joi from 'joi'
import { generalFields } from '../../middlewares/validation.js'

export const addReviewSchema = {
  body: Joi.object({
    reviewRate: Joi.number().min(1).max(5).required(),
    reviewComment: Joi.string().min(5).max(350).optional(),
  }),
  query:Joi.object({
    productID: generalFields._id.required()
  })
}
