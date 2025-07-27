import Joi from "joi";



export const registrationSchema = {
    body: Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password'))
    })
}



export const loginSchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/).required(),
    })
}



export const sendForgetPasswordOtp_Schema = {
    body: Joi.object({
        email: Joi.string().email().required(),
    })
}


export const resetPasswordSchema  = {
    body: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.number().required(),
        newPassword: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/).required(),
        confirmNewPassword: Joi.string().valid(Joi.ref('newPassword'))
    })
}

