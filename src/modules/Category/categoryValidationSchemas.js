import joi from 'joi'
export const createCategorySchema = {
  body: joi
    .object({
      name: joi.string().min(4).max(15),
    })
    .required()
    .options({ presence: 'required' }),
}

export const updateCategorySchema = {
  body: joi
    .object({
      name: joi.string().min(4).max(15).optional(),
    })
    .required(),
}