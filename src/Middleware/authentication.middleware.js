import BlackListTokens from "../DB/models/black-list-tokens.model.js"
import User from "../DB/models/user.model.js"
import { verifyToken } from "../utils/jwt.utils.js"
import fs from 'fs'




export const authenticationMiddleware = () => {
    return async (req, res, next) => {
        const {accesstoken} = req.headers

        if(!accesstoken){
            return res.status(400).json({message: 'Access tohen required, please login'})
        }

        const publicKeyAccess = fs.readFileSync('keys/public.key', 'utf-8')
        const decodedData = verifyToken({token: accesstoken, publicKey: publicKeyAccess})

        const isTokenBlackListed = await BlackListTokens.findOne({tokenId: decodedData.jti})
        if(isTokenBlackListed){
            return res.status(401).json({message: 'Access token is blacklisted, please login'})
        }

        const user = await User.findById(decodedData._id, '-password -__v')
        if(!user){
            return res.status(404).json({message: 'User not found, please sign Up'})
        }

        req.authUser = {
            ...user._doc,
            token: {
                tokenId: decodedData.jti,
                expiryDate: decodedData.exp
            }
        }
        next()
    }
}



export const checkRefreshToken = () => {
    return async (req, res, next) => {
        const {refreshtoken} = req.headers
        if(!refreshtoken){
            return res.status(400).json({message: 'Refresh tohen required, please login'})
        }

        const publicKeyRefresh = fs.readFileSync('keys/refresh_public.key', 'utf-8')
        const decodedData = verifyToken({token: refreshtoken, publicKey: publicKeyRefresh})
        
        const isTokenBlackListed = await BlackListTokens.findOne({tokenId: decodedData.jti})
        if(isTokenBlackListed){
            return res.status(401).json({message: 'Refresh token is blacklisted, please login'})
        }

        req.refreshToken = {
            tokenId: decodedData.jti,
            expiryDate: decodedData.exp,
            iat: decodedData.iat,
            _id: decodedData._id,
        }
        next()
    }
}



export const authorizationMiddleware = (allowedRoles = []) => {
    return async (req, res, next) => {
        
        const {role} = req.authUser

        const isRoleAllowed = allowedRoles.includes(role)
        
        if(!isRoleAllowed){
            return res.status(401).json({message: 'Unauthorized role'})
        }
        next()
    }
} 
