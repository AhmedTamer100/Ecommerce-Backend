import joi from 'joi'
import { generalFields } from '../../middlewares/validation.js'

export const SignUpSchema={
    body: joi
    .object({
    firstname: joi
        .string()
        .min(2)
        .max(10)
        .messages({
          'string.min': 'FirstName must be at least 2 characters long',
          'string.max': 'FirstName must be at most 10 characters long',
          'string.base': 'FirstName must be a string',
          'any.required': 'FirstName is required',
        }),
    lastname:joi
          .string()
          .min(2)
          .max(10)
          .messages({
            'string.min': 'LastName must be at least 2 characters long',
            'string.max': 'LastName must be at most 10 characters long',
            'string.base': 'LastName must be a string',
            'any.required': 'LastName is required',
          }),
    email: generalFields.email,
    password: generalFields.password,
    ConfirmPassword: joi.valid(joi.ref('password')).messages({
      'any.only': 'Passwords do not match',
      }),
    day: generalFields.day,
    month: generalFields.month,
    year: generalFields.year,
    address: generalFields.address,
    phoneNumber: generalFields.phone,
    gender: generalFields.gender,
    })
    .required(),
  
}

export const ForgetPass = {
  body: joi
    .object({
      newPassword: generalFields.password
    }).required()
}

export const ChangePass = {
  body: joi
    .object({
      email: generalFields.email,
      password: generalFields.password,
      newPassword: generalFields.password
    }).required()
}

export const ChangeInfo ={
  body:joi
    .object({
      firstname: joi
        .string()
        .min(2)
        .max(10)
        .messages({
          'string.min': 'FirstName must be at least 2 characters long',
          'string.max': 'FirstName must be at most 10 characters long',
          'string.base': 'FirstName must be a string',
          'any.required': 'FirstName is required',
        }),
    lastname:joi
          .string()
          .min(2)
          .max(10)
          .messages({
            'string.min': 'LastName must be at least 2 characters long',
            'string.max': 'LastName must be at most 10 characters long',
            'string.base': 'LastName must be a string',
            'any.required': 'LastName is required',
          }),
      day: generalFields.day,
      month: generalFields.month,
      year: generalFields.year,
      phoneNumber: generalFields.phone,
      address: generalFields.address,
    })
}