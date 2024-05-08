import {Router} from 'express'
const router=Router()
import * as uc from './user.controller.js'
import { validationCoreFunction } from '../../middlewares/validation.js'
import { ChangeInfo, ChangePass, ForgetPass, SignUpSchema } from './user.validationSchemas.js'
import { asyncHandler } from '../../utils/errorhandling.js'

router.post('/SignUp',validationCoreFunction(SignUpSchema),asyncHandler(uc.SignUp))
router.get('/confirmEmail/:token',asyncHandler(uc.ConfirmEmail))
router.put('/Login',asyncHandler(uc.LogIn))
router.post('/forgetpass',asyncHandler(uc.forgetPassword))
router.post('/Resetpass/:token',asyncHandler(uc.Resetpassword))
router.patch('/changePass/:token',validationCoreFunction(ChangePass),asyncHandler(uc.ChangePassword))
router.patch('/updateInfo',validationCoreFunction(ChangeInfo),asyncHandler(uc.UpdateInfo))
router.delete('/DeleteUser',asyncHandler(uc.DeleteUser))
router.patch('/logout',asyncHandler(uc.LogOut))

export default router
