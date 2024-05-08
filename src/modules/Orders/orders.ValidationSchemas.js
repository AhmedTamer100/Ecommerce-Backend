
import Joi from 'joi'
import { generalFields } from '../../middlewares/validation.js'

export const createOrderSchema = {
  body: Joi.object({
    address: Joi.string().required(),
    phoneNo: Joi.array().items(Joi.string().required()).required(),
    productID: generalFields._id.required(),
    quantity: Joi.number().positive().integer().min(1).required(),
    paymentMethod: Joi.string().required(),
    couponCode: Joi.string().optional(),
  }).required(),
  headers: Joi.object({
    authorization: Joi.string().required(),
  })
    .required()
    .unknown(),
}
