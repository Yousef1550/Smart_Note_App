import { compareSync, hashSync } from "bcrypt"
import User from "../../../DB/models/user.model.js"
import { signToken } from "../../../utils/jwt.utils.js"
import { v4 as uuidv4 } from 'uuid';
import { HTML_TEMPLATE_forgetPassword } from "../../../utils/html-template.utils.js";
import { emitter } from "../../../Services/send-email.service.js";
import BlackListTokens from "../../../DB/models/black-list-tokens.model.js";
import fs from 'fs'


/**
 * Handles user registration process.
 * 
 * Steps:
 * 1. Validates if password and confirmPassword match.
 * 2. Checks if the email is already registered.
 * 3. Creates a new user in the database if all validations pass.
 * 
 * @function registrationService
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Contains username, email, password, confirmPassword
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */


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




/**
 * Handles user login and generates access and refresh tokens.
 * 
 * Steps:
 * 1. Validates user email and password.
 * 2. If credentials are valid, generates JWT access and refresh tokens using private keys.
 * 
 * @function loginService
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Contains email and password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with access and refresh tokens or error message
 */


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




/**
 * Generates a new access token using a valid refresh token.
 * 
 * Assumes that a middleware has already verified the refresh token and 
 * attached the decoded data (e.g. user ID) to `req.refreshToken`.
 * 
 * @function refreshTokenService
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.refreshToken - Decoded refresh token payload (must contain user _id)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with new access token
 */

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




/**
 * Uploads and saves the user's profile picture.
 * 
 * Steps:
 * 1. Checks if a file has been uploaded.
 * 2. Updates the authenticated user's profile with the uploaded file path.
 * 
 * Assumes:
 * - `req.authUser` contains the authenticated user's data (including `_id`).
 * - `req.file` contains the uploaded file (e.g., via multer middleware).
 * 
 * @function uploadProfilePic_service
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.authUser - Contains authenticated user's data
 * @param {Object} req.file - Uploaded file object (from multer)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */

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





/**
 * Logs out a user by blacklisting both access and refresh tokens.
 * 
 * Steps:
 * 1. Authenticates the user again using email and password (extra security step).
 * 2. Extracts token info from `req.authUser` and `req.refreshToken`.
 * 3. Stores token IDs and their expiry dates in a blacklist collection to invalidate them.
 * 
 * Assumes:
 * - `req.authUser.token` contains access token data (tokenId, expiryDate).
 * - `req.refreshToken` contains refresh token data (tokenId, expiryDate).
 * 
 * @function signOutService
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.authUser - Contains authenticated user's access token data
 * @param {Object} req.refreshToken - Contains refresh token data
 * @param {Object} req.body - Contains user credentials (email and password)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with logout confirmation or error message
 */


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





/**
 * Sends a one-time password (OTP) to the user's email to reset their password.
 * 
 * Steps:
 * 1. Verifies if the email exists in the database.
 * 2. Generates a 4-digit OTP and sets an expiration time (10 minutes).
 * 3. Hashes the OTP and stores it in the user's document.
 * 4. Emits an email event to send the OTP to the user.
 * 
 * Assumes:
 * - There's an event listener for `sendEmail` that handles actual email sending.
 * - The user model has a field `OTP` with `{ code: String, expiresIn: Date }`.
 * - `HTML_TEMPLATE_forgetPassword` generates the HTML body for the OTP email.
 * 
 * @function sendForgetPasswordOtpService
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Contains user's email
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with status message
 */


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






/**
 * Resets the user's password using a valid OTP.
 * 
 * Steps:
 * 1. Verifies that the new password and its confirmation match.
 * 2. Checks if the user exists by email.
 * 3. Validates if the OTP is not expired.
 * 4. Compares the provided OTP with the hashed OTP in the database.
 * 5. If valid, updates the user's password and removes the stored OTP.
 * 
 * Assumes:
 * - OTP is stored in user.OTP as an object with `code` (hashed) and `expiresIn` (Date).
 * - Passwords are hashed automatically via a pre-save hook or middleware.
 * 
 * @function resetPasswordService
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Contains email, otp, newPassword, confirmNewPassword
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */

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







