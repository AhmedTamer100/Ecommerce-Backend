import { usermodel } from "../../../DB/Models/user.model.js"
import { sendEmailAccess } from "../../services/sendEmailService.js"
import { EmailTemp } from "../../utils/EmailTemplate.js"
import { Tokengen, verifyToken } from "../../utils/TokenFunction.js"
import bcrypt from 'bcrypt'
import { nanoid } from "nanoid"

////////////////////////////////Sign Up/////////////////////////////////////
export const SignUp=async(req,res,next)=>{
const {firstname,lastname,email,password,ConfirmPassword,day,month,year,gender,phoneNumber,address}=req.body

const isUserExists=await usermodel.findOne({email})
if(isUserExists){
    return res.json({message:'Email Already Exists'})
}
if(ConfirmPassword!==password){
    return res.json({message:'Password Not Match'})
}
const token=Tokengen({
    payload:{
        email,
    },
    signature:process.env.CONFIRM_EMAIL_TOKEN,
    expiresIn:'3h'
})
const confirmationLink=`${req.protocol}://${req.headers.host}/user/confirmEmail/${token}`
const ifEmailSent=sendEmailAccess({
    to:email,
    subject:'Email Confirmation',
    message:EmailTemp({
        link:confirmationLink,
        subject:'Email Confirmation',
        linkData:'Click Here To Confirm Email'
    })
})
if(!ifEmailSent){
    return next(new Error('Please try again later or contact the support team',{cause:400}))
}
const userInfo=new usermodel({
    firstname,
    lastname,
    email,
    password,
    day,
    month,
    year,
    gender,
    phoneNumber,
    address
})
const SavedUser=await userInfo.save()
await usermodel.findByIdAndUpdate(
SavedUser._id,
{IsOnline:true},
{new:true})
res.status(200).json({message:'Created SuccessFully',token})
}

/////////////////////////////////Confirm Email///////////////////////////////////
export const ConfirmEmail=async(req,res,next)=>{
const {token} =req.params
const decode=verifyToken({
    token,
    signature:process.env.CONFIRM_EMAIL_TOKEN
})
const user= await usermodel.findOneAndUpdate(
    {email:decode?.email,isConfirmed:false},  //Should be email not Confirmed Yet To Confirm His Email 
    {isConfirmed:true},
    {new:true}
)
if (!user){
    return next(new Error('Already Confirmed',{cause:400}))
}
res.status(200).json({message:'Confirmed SuccessFully'})
}

//////////////////////////////////////LogIn/////////////////////////////////////
export const LogIn=async(req,res,next)=>{
const {email,password}=req.body
const isUserExist = await usermodel.findOne({email})
const user =isUserExist.email
console.log(user)

const passwordMatch=bcrypt.compareSync(password,isUserExist.password)
if(!passwordMatch){
    return next(new Error('Invalid Email or Password',{cause:400}))
}

const token =Tokengen({
    payload:{
        email,
        password,
        _id:isUserExist._id,
        role:isUserExist.role
    },
    signature:process.env.CONFIRM_EMAIL_TOKEN,
    expiresIn:'3h'
})
const userUpdated=await usermodel.findOneAndUpdate(
    {email},
    {
      token,
      IsOnline:true
    },{
        new:true
    }
)
res.status(200).json({message:'Logged In SuccessFully',token})
}

///////////////////////////////forget password/////////////////////////////////////
export const forgetPassword=async(req,res,next)=>{
    const {email}=req.body
    const isUserExist=usermodel.findOne({email})
    if(!isUserExist){
        return next(new Error('Invalid Email',{cause:400}))
    }
    const code=nanoid()  
    const hashingCode=bcrypt.hashSync(code,+process.env.PASS_RESET_TOKEN)  //Generates token with email,Hash Code
    const token =Tokengen({
        payload:{
        email,
        sentCode:hashingCode
        },
        signature: process.env.RESET_TOKEN,
        expiresIn:'3h'
        })
    const ResetPassLink=`${req.protocol}://${req.headers.host}/user/Resetpass/${token}`
    const ifEmailSent=sendEmailAccess({
        to:email,
        subject:'Reset Password',
        message:EmailTemp({
            link:ResetPassLink,
            linkData:'Click Here To Reset Your Password',
            subject:'Reset Password'
        })
    })
    if(!ifEmailSent){
        return next(new Error('Please try again later or contact the support team',{cause:400}))
    }
    const userUpdates=await usermodel.findOneAndUpdate(
        {email},
        {forgetPassword:hashingCode},
        {new:true}
    )
    res.status(200).json({message:'Reset Password Link Sent SuccessFully',userUpdates})
}

////////////////////////////////Reset Password///////////////////////////////////
export const Resetpassword=async(req,res,next)=>{
    const {token}=req.params
    const decode =verifyToken({
        token,
        signature:process.env.RESET_TOKEN
    })
    const user=await usermodel.findOne({
        email:decode?.email,
        forgetPassword:decode?.sentCode
    })
    if(!user){
        return next(new Error('Failed',{cause:400}))
    }
    const {newPassword}=req.body
    user.password=newPassword
    user.forgetCode=null

    const ResPass=await user.save()
    res.status(200).json({message:'Password Changed SuccessFully',ResPass})
}

////////////////////////CHANGE PASSWORD////////////////////////
export const ChangePassword =async(req,res,next)=>{
    const{email,password,newPassword}=req.body
    const Emailchecking=await usermodel.findOne({email})
    if(!Emailchecking){
      return res.json({message:'Invalid Email OR Password'})
    }
    const Passwordchecking=bcrypt.compareSync(password,Emailchecking.password)
    if(!Passwordchecking){
      return res.json({message:'Invalid Email OR Password'})
    }
    const hashhedPassword = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS)
    await usermodel.findOneAndUpdate({Email:Emailchecking.email},{Password:hashhedPassword},{new:true})
    res.json({message:'Password Updated Successfully'})
  }

  /////////////////////////Update User's(FirstName,LastName,day,month,year,Phone,address)////////////////////
  export const UpdateInfo=async(req,res,next)=>{
  const{userID}=req.query
  const{firstname,lastname,day,month,year,phoneNumber,address}=req.body
  
  const userExists = await usermodel.findById(userID)
  if (!userExists) {
    return res.status(400).json({ message: 'in-valid userId' })
  }

  if (userExists._id.toString()!==userID) { 
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const newrec = await usermodel.findByIdAndUpdate(
    { _id: userID },
    { firstname,lastname,day,month,year,phoneNumber,address},
    { new: true },
  )
  res.status(200).json({ message: 'updated Successfully',newrec})
}

/////////////////////////////Delete User//////////////////////////
export const DeleteUser = async (req, res, next) => {
  const{email,password,ConfirmPassword}=req.body
  const{userID}=req.query
  const Emailchecking=await usermodel.findOne({email})
  if(!Emailchecking){
    return res.json({message:'Invalid Email OR Password'})
  }
  const Passwordchecking=bcrypt.compareSync(password,Emailchecking.password)
  if(ConfirmPassword != password){
    return res.json({message:'Password not match'})
  }
  if(!Passwordchecking){
    return res.json({message:'Invalid Email OR Password'})
  }
  if(Emailchecking._id.toString()!==userID){
    return res.status(401).json({ message: 'USER DOESNT EXIST' })
  }
  const deletion=await usermodel.findOneAndDelete({email})
  return res.status(200).json({ message: 'Deleted Successfully',deletion})
}

///////////////////////////LOGOUT/////////////////////////
export const LogOut=async(req,res,next)=>{
  const{email,password}=req.body
  const EmailCheck = await usermodel.findOne({email})
  if(!EmailCheck){
    res.status(400).json({message : 'Invalid Email OR Password'})
  }
  const PasswordCheck=bcrypt.compareSync(password,EmailCheck.password)
  if(!PasswordCheck){
    res.status(400).json({message:'Invalid Email OR password'})
  }
  const logOut=await usermodel.findOneAndUpdate(
    {email},
    {IsOnline:false},
    {new:true}
  )
  res.status(200).json({message:'Logged Out SuccessFully',logOut})
}
