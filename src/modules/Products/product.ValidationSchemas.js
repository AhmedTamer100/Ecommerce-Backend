import Joi from 'joi'
import { generalFields } from '../../middlewares/validation.js'


export const AddProductSchema = {
  body: Joi.object({
    title: Joi.string().min(4).max(50).required(),
    desc: Joi.string().min(5).max(100).optional(),
    price: Joi.number().positive().min(1).required(),
    appliedDiscount: Joi.number().positive().min(1).max(100).optional(),
    colors: Joi.array().items(Joi.string().required()).optional(),
    sizes: Joi.array().items(Joi.string().required()).optional(),
    stock: Joi.number().integer().positive().min(1).required(),
  }),
  // IDs
  query: Joi.object({
    categoryID: generalFields._id, 
    subcategoryID: generalFields._id,
    brandID: generalFields._id
  })
    .required()
    .options({ presence: 'required' }),
}

export const updateProductSchema = {
  body: Joi.object({
    title: Joi.string().min(5).max(20).optional(),
    desc: Joi.string().min(5).max(150).optional(),
    price: Joi.number().positive().min(1).optional(),
    appliedDiscount: Joi.number().positive().min(1).max(100).optional(),
    colors: Joi.array().items(Joi.string().required()).optional(),
    sizes: Joi.array().items(Joi.string().required()).optional(),
    stock: Joi.number().integer().positive().min(1).optional(),
  }),
}