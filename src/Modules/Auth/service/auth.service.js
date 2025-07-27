import { compareSync, hashSync } from "bcrypt"
import User from "../../../DB/models/user.model.js"
import { signToken } from "../../../utils/jwt.utils.js"
import { v4 as uuidv4 } from 'uuid';
import { HTML_TEMPLATE_forgetPassword } from "../../../utils/html-template.utils.js";
import { emitter } from "../../../Services/send-email.service.js";
import BlackListTokens from "../../../DB/models/black-list-tokens.model.js";
import fs from 'fs'





export const registrationService = async (req, res) => {
    const {username, email, password, confirmPassword} = req.body

    if(password != confirmPassword){
        return res.status(400).json({message: 'Password and confirm password should match'})
    }

    const isEmailExist = await User.findOne({email})
    if(isEmailExist){
        return res.status(400).json({message: 'Email already exists'})
    }

    const user = await User.create({
        username,
        email,
        password
    })
    if(!user){
        return res.status(409).json({message: 'Something went wrong, please try again later'})
    }

    return res.status(200).json({message: 'User created successfully'})
}



export const loginService = async (req, res) => {
    const {email, password} = req.body

    const user = await User.findOne({email})
    if(!user){
        return res.status(400).json({message: 'Invalid credintials'})
    }

    const isPasswordMatched = compareSync(password, user.password)      
    if(!isPasswordMatched){
        return res.status(409).json({message: 'Invalid credentials'})
    }
    
    const privateKeyAccess = fs.readFileSync('keys/private.key', 'utf-8')
    const accesstoken = signToken(
        {
            data: {_id: user._id},
            privateKey: privateKeyAccess,
            options: {expiresIn: process.env.ACCESS_EXPIRATION_TIME, jwtid: uuidv4()}
        }
    )

    const privateKeyRefresh = fs.readFileSync('keys/refresh_private.key', 'utf-8')
    const refreshtoken = signToken(
        {
            data: {_id: user._id},
            privateKey: privateKeyRefresh,
            options: {expiresIn: process.env.REFRESH_EXPIRATION_TIME, jwtid: uuidv4()}
        }
    )
    
    return res.status(200).json({message: 'User logged in successfully', accesstoken, refreshtoken})
}


export const refreshTokenService = async (req, res) => {
    const {refreshToken} = req

    const privateKeyAccess = fs.readFileSync('keys/private.key', 'utf-8')
    const accesstoken = signToken(
        {
            data: {_id: refreshToken._id},
            privateKey: privateKeyAccess,
            options: {expiresIn: process.env.ACCESS_EXPIRATION_TIME, jwtid: uuidv4()}
        }
    )
    return res.status(200).json({message: 'Token refreshed successfully', accesstoken})
}


export const uploadProfilePic_service = async (req, res) => {
    const {_id} = req.authUser
    const {file} = req
    if(!file){
        return res.status(400).json({ message: 'No file uploaded' })
    }
    
    await User.findByIdAndUpdate(
        { _id },
        { profilePicture: file.path }
    )
    return res.status(200).json({message: 'File uploaded successfully',})
}



export const signOutService = async (req, res) => {
    const {token} = req.authUser
    const {refreshToken} = req
    const {email, password} = req.body

    const user = await User.findOne({email})
    if(!user){
        return res.status(400).json({message: 'Invalid credintials'})
    }

    const isPasswordMatched = compareSync(password, user.password)      
    if(!isPasswordMatched){
        return res.status(409).json({message: 'Invalid credentials'})
    }
    
    await BlackListTokens.insertMany(
        [
            {
                tokenId: token.tokenId,
                expiryDate: token.expiryDate
            },
            {
                tokenId: refreshToken.tokenId,
                expiryDate: refreshToken.expiryDate
            }
        ]
    )

    return res.status(200).json({message: 'User logged out successfully'})
}



export const sendForgetPasswordOtpService = async (req, res) => {
    const {email} = req.body

    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({message: 'User not found, please sign Up first'})
    }

    const confirmOtp = Math.floor(Math.random() * 10000)
    const expiresIn = new Date(Date.now() + 10 * 60 * 1000)      // 10 min
    const hashedOtp = hashSync(confirmOtp.toString(), +process.env.SALT_ROUNDS)

    emitter.emit('sendEmail', {
        to: email,
        subject: 'Reset your password',
        html: HTML_TEMPLATE_forgetPassword(confirmOtp)
    })

    user.OTP = {
            code: hashedOtp,
            expiresIn
    }
    
    await user.save()
    return res.status(200).json({message: 'Forget Password OTP sent successfully'})
}


export const resetPasswordService = async (req, res) => {
    const {email, otp, newPassword, confirmNewPassword} = req.body
    
    if(newPassword !== confirmNewPassword){
        return res.status(409).json({message: 'New password and confirm new password does not match'})
    }
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({message: 'User not found, please sign Up first'})
    }
    const { OTP } = user
    if(new Date(OTP.expiresIn) < new Date()){
        return res.status(400).json({message: 'OTP expired'})
    }

    const isOtpValid = compareSync(otp.toString(), OTP.code.toString())
    if(!isOtpValid){
        return res.status(400).json({message: 'Invalid OTP'})
    }

    await User.findOneAndUpdate(
        { email },
        { password: newPassword, $unset: { OTP: '' }}
    )
    return res.status(200).json({message: 'Password changed successfully'})
}







