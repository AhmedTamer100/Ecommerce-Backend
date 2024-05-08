import joi from 'joi'
import { Types } from 'mongoose'
const reqMeth=['body','query','headers','params','file','files']

const ValidationObjectId=(value,helper)=>{
    return Types.ObjectId.isValid(value)
    ? true 
    : helper.message('Invalid ObjectId')
}

export const generalFields = {
    email: joi
      .string()
      .email({ tlds: { allow: ['com', 'net', 'org'] } }) 
      .messages({
        'string.email': 'Email must be a valid email address',
      })
      .required(),
    password: joi  
      .string()
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/) 
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long', 
      })
      .required(),
    day: joi
      .number()
      .integer()
      .min(1)
      .max(31)
      .messages({
        'number.integer': 'Day must be an integer',
        'number.min': 'Day must be greater than or equal to 1',
        'number.max': 'Day must be less than or equal to 31',
        'any.required': 'Day is required',
      })
      .required(),
    month: joi
      .number()
      .integer()
      .min(1)
      .max(12)
      .messages({
        'number.integer': 'Month must be an integer',
        'number.min': 'Month must be greater than or equal to 1',
        'number.max': 'Month must be less than or equal to 12',
        'any.required': 'Month is required',
      })
      .required(),
    year: joi
      .number()
      .integer()
      .min(1900)
      .max(2024)
      .messages({
        'number.integer': 'Year must be an integer',
        'number.min': 'Year must be greater than or equal to 1900',
        'number.max': 'Year must be less than or equal to 2024',
        'any.required': 'Year is required',
      })
      .required(),
    address: joi
      .string()
      .messages({
      'any.required': 'Address is required',
      })
      .required(),
    phone: joi
      .string()
      .pattern(new RegExp('\\d{10}'))
      .messages({
        'string.pattern.base': 'Phone must be 10 digits',
        'any.required': 'Phone is required',
        })
        .required(),
    gender: joi
      .string()
      .messages({
      'any.required': 'Gender is required',
      })
      .required(),
     _id:joi.string().custom(ValidationObjectId) 
  }

  export const validationCoreFunction = (schema) => {
    return (req, res, next) => {
      // req
      const validationErrorArr = []
      for (const key of reqMeth) {
        if (schema[key]) {
          const validationResult = schema[key].validate(req[key], {
            abortEarly: false,
          }) // error
          if (validationResult.error) {
            validationErrorArr.push(validationResult.error.details)
          }
        }
      }
      if (validationErrorArr.length) {
        return res
          .status(400)
          .json({ message: 'Validation Error', Errors: validationErrorArr })
      }
      next()
    }
  }