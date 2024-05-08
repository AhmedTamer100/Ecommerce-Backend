import multer from "multer"
import { AllowedEx } from "../utils/allowerdExtensions.js"


export const MulterCloudFun = (allowedExtensionsArr) => {
  if (!allowedExtensionsArr) {
    allowedExtensionsArr = AllowedEx.Image
  }
  ////////////////////////////////////// Storage /////////////////////////////////
  const storage = multer.diskStorage({})

  /////////////////////////////////// File Filter ////////////////////////////////
  const fileFilter = function (req, file, cb) {
    if (allowedExtensionsArr.includes(file.mimetype)) {
      return cb(null, true)
    }
    cb(new Error('invalid extension', { cause: 400 }), false)
  }

  const fileUpload = multer({
    fileFilter,
    storage,
  })
  return fileUpload
}