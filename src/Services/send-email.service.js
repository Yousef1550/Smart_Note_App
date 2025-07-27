import nodemailer from 'nodemailer'
import { EventEmitter } from 'node:events'




export const sendEmailService = async ({to, subject, html} = {}) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',  // smtp.gmail.com || localhost
            port: 465,
            secure: true,
            auth:{
                user: process.env.EMAIL_USER,       // account criedentials that the email will be sent from
                pass: process.env.EMAIL_PASS
            }
        })

        const info = await transporter.sendMail({
            from: `Note App <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        })

        return info

    } catch (error) {
        console.log(error);
        return error
    }
}


export const emitter = new EventEmitter

emitter.on('sendEmail', (...args) => {
    const {to, subject, html} = args[0]
    sendEmailService({to, subject, html})
})