import { Router } from "express";
import { loginService, refreshTokenService, registrationService, resetPasswordService, sendForgetPasswordOtpService, signOutService, uploadProfilePic_service } from "./service/auth.service.js";
import { errorHandler } from "../../Middleware/error-handler.middleware.js";
import { loginSchema, registrationSchema, resetPasswordSchema, sendForgetPasswordOtp_Schema } from "../../Validators/User/auth.schema.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import { authenticationMiddleware, checkRefreshToken } from "../../Middleware/authentication.middleware.js";
import { MulterLocal } from "../../Middleware/multer.middleware.js";
import { imageExtentions } from "../../Constants/constants.js";


const authController = Router()



authController.post('/register', errorHandler(validationMiddleware(registrationSchema)), errorHandler(registrationService))

authController.post('/login', errorHandler(validationMiddleware(loginSchema)), errorHandler(loginService))

authController.post('/refreshtoken', errorHandler(checkRefreshToken()), errorHandler(refreshTokenService))

authController.patch('/uploadProfilePic',
    errorHandler(authenticationMiddleware()),
    MulterLocal(imageExtentions).single('image'),
    errorHandler(uploadProfilePic_service)
)

authController.post('/signOut',
    errorHandler(authenticationMiddleware()),
    errorHandler(checkRefreshToken()),
    errorHandler(signOutService)
)

authController.post('/sendForgetPasswordOtp', errorHandler(validationMiddleware(sendForgetPasswordOtp_Schema)),
errorHandler(sendForgetPasswordOtpService))

authController.put('/resetPassword', errorHandler(validationMiddleware(resetPasswordSchema)), errorHandler(resetPasswordService))





export default authController