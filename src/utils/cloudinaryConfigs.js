import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  api_key: '',   //In Your Cloudinary Account
  api_secret: '',
  cloud_name: '',
})

export default cloudinary