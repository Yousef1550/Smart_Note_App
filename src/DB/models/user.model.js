import mongoose from "mongoose";
import { hashSync } from "bcrypt";






const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: String,
    OTP: {
        code: String,
        expiresIn: Date,
    }
}, {
    timestamps: true
})


userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = hashSync(this.password, +process.env.SALT_ROUNDS)
    }
    next()
})


userSchema.pre('findOneAndUpdate', async function(next){
    const update = this.getUpdate();

    if(update.password){
        update.password = hashSync(update.password, +process.env.SALT_ROUNDS);
    }
    next()
})

const User = mongoose.models.User || mongoose.model('User', userSchema)


export default User