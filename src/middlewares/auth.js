import { usermodel } from '../../DB/Models/user.model.js'
import { Tokengen, verifyToken } from '../utils/TokenFunction.js'


export const isAuth=(role)=>{
  return async(req,res,next)=>{
    try{
      const {authorization}=req.headers
      if(!authorization){
        return next(new Error('Please login first', { cause: 400 }))
      }
      if(!authorization.startsWith('AT')){
        return next(new Error('Invalid Token', { cause: 400 }))
      }
      const SplitToken=authorization.split(' ')[1]

      try{
        const decodedData = verifyToken({
          token: SplitToken,
          signature: process.env.CONFIRM_EMAIL_TOKEN,
            })

        if(!decodedData || !decodedData._id){
            return res.status(400).json({message:'Invalid Token'})
        }
        const FINDUSER=await usermodel.findById(decodedData._id,'email username role')
        if(!FINDUSER){
          return next(new Error('Please Sign Up', { cause: 400 }))
        }
        if(!role.includes(FINDUSER.role)){
          return next(new Error('Unauthorized User', { cause: 400 }))
        }
        req.authUser=FINDUSER
        next()
      }catch(error){
      if(error =='TokenExpiredError: jwt expired'){
        //Refresh Token
        const RefUserToken=await usermodel.findOne({token:SplitToken})
        if(!RefUserToken){
          return next(new Error('Wrong Token', { cause: 400 }))
        }
        //Generating New One
        const GenToken=Tokengen({
          payload:{
            email:RefUserToken.email,
            password:RefUserToken.password,
            _id:RefUserToken._id
          },
          signature:process.env.CONFIRM_EMAIL_TOKEN,
          expiresIn:'3h'
        })
        if(!GenToken){
          return next(new Error('Failed To Refresh Token , Empty Payload', { cause: 400 }))
        }
        //Update Token
        await usermodel.findOneAndUpdate(
          {_id:RefUserToken._id},
          {token:GenToken}
        )
        return res.status(200).json({message :'Token Refreshed Succesfully',token:GenToken})
      }
      return next(new Error('Invalid Token', { cause: 500 }))
     
    }
    }catch(error){
      console.log(error)
      return next(new Error('Maybe Error In Auth', { cause: 500 }))
    }
  }
}
